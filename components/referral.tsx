'use client';
import { useState } from 'react';
import { Copy, Download, Printer } from 'lucide-react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Section } from '@astryxdesign/core/Section';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';
import { reportText, downloadText } from '@/lib/report';
import type { Assessment } from '@/lib/model';

export function ReferralDialog({
  open,
  onOpenChange,
  record,
  onPrint,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record: Assessment;
  onPrint: (text: string) => void;
}) {
  const [comment, setComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const text = reportText(record, true, comment);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError('');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        'Не удалось скопировать. Скачайте шаблон или выделите текст вручную.',
      );
    }
  };
  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      purpose="form"
      width={760}
      maxHeight="90dvh"
      aria-label="Направление к генетику"
    >
      <Layout
        height="fill"
        padding={6}
        header={
          <DialogHeader
            title="Направление к генетику"
            subtitle="Учебный шаблон на основе оценки. Документ не отправляется автоматически."
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent isScrollable>
            <VStack gap={5}>
              <TextArea
                label="Дополнение врача"
                value={comment}
                onChange={(value) => {
                  setComment(value.slice(0, 1500));
                  setCopied(false);
                }}
                placeholder="Дополнительные вопросы для консультации…"
                maxLength={1500}
                rows={3}
                width="100%"
              />
              <Section variant="muted" padding={5}>
                <Text
                  as="p"
                  className="whitespace-pre-wrap break-words"
                  data-testid="referral-preview"
                >
                  {text}
                </Text>
              </Section>
              {error && (
                <Banner status="error" title={error} collapsible={false} />
              )}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={3} justify="end" wrap="wrap">
              <Button
                label={copied ? 'Скопировано' : 'Копировать'}
                icon={<Copy className="size-4" />}
                onClick={() => void copy()}
              />
              <Button
                label="Скачать TXT"
                icon={<Download className="size-4" />}
                onClick={() =>
                  downloadText(
                    text,
                    'GenCompass-' +
                      (record.code || 'referral') +
                      '-направление.txt',
                  )
                }
              />
              <Button
                label="Печать / PDF"
                icon={<Printer className="size-4" />}
                variant="primary"
                onClick={() => onPrint(text)}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
