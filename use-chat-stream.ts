import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListOpenaiMessagesQueryKey, getGetOpenaiConversationQueryKey } from '@workspace/api-client-react';

interface UseChatStreamProps {
  conversationId: number;
}

interface SendMessageOptions {
  hrMode?: boolean;
  language?: string;
}

export function useChatStream({ conversationId }: UseChatStreamProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = useCallback(async (content: string, options: SendMessageOptions = {}, image?: File) => {
    setIsStreaming(true);
    setStreamedContent('');
    setGeneratedImage(null);

    try {
      let res: Response;

      if (image) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('image', image);

        const headers: Record<string, string> = {};
        if (options.hrMode) headers['x-hr-mode'] = 'true';
        if (options.language && options.language !== 'English') headers['x-language'] = options.language;

        res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: formData,
        });
      } else {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (options.hrMode) headers['x-hr-mode'] = 'true';
        if (options.language && options.language !== 'English') headers['x-language'] = options.language;

        res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ content }),
        });
      }

      if (!res.ok) throw new Error('Failed to send message');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.done) {
                done = true;
              } else if (data.generatedImage) {
                setGeneratedImage(data.generatedImage);
              } else if (data.content) {
                setStreamedContent(prev => prev + data.content);
              }
            } catch (e) {
              console.error('Failed to parse SSE chunk', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(conversationId) });
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(conversationId) });
    }
  }, [conversationId, queryClient]);

  return {
    sendMessage,
    isStreaming,
    streamedContent,
    generatedImage
  };
}
