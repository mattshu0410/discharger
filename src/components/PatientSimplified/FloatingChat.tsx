'use client';

import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type FloatingChatProps = {
  isPreview?: boolean;
};

export const FloatingChat = ({ isPreview = false }: FloatingChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(!isPreview);

  return (
    <div className="absolute bottom-4 right-4 z-50">
      {isOpen
        ? (
            <Card className="w-80 h-96 shadow-xl border-2">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Medical Assistant</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    ×
                  </Button>
                </div>

                <div className="flex-1 bg-muted/30 rounded-lg p-3 mb-3 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="bg-primary/10 p-3 rounded-lg text-sm border border-primary/20">
                      Hi John! I'm here to help with any questions about your recovery. How are you feeling today?
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Suggested questions:</p>
                      <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                        When should I take my next medication?
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                        What activities should I avoid?
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start h-auto p-2 text-left">
                        I'm experiencing mild pain, is this normal?
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your question..."
                    className="flex-1"
                    disabled={isPreview}
                  />
                  <Button size="sm" disabled={isPreview}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        : (
            <Button
              className="w-14 h-14 rounded-full shadow-xl relative hover:scale-105 transition-transform"
              onClick={() => {
                setIsOpen(true);
                setHasUnread(false);
              }}
            >
              <MessageCircle className="w-6 h-6" />
              {hasUnread && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 hover:bg-red-500 animate-pulse">
                  !
                </Badge>
              )}
            </Button>
          )}
    </div>
  );
};
