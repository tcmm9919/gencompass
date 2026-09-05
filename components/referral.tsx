'use client';
import { Copy, Download, Printer, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { reportText, downloadText } from '@/lib/report';
import { type Assessment } from '@/lib/model';
import { useState } from 'react';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="referral-dialog" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Направление к генетику</DialogTitle>
          <DialogDescription>
            Учебный шаблон на основе оценки. Документ не отправляется
            автоматически.
          </DialogDescription>
        </DialogHeader>
        <DialogClose className="dialog-x" aria-label="Закрыть">
          <X size={19} />
        </DialogClose>
        <label className="referral-comment">
          Дополнение врача
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Дополнительные вопросы для консультации…"
            maxLength={1500}
            rows={3}
          />
        </label>
        <div className="referral-preview">
          <pre>{text}</pre>
        </div>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button className="button secondary" onClick={copy}>
            <Copy size={16} />
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
          <button
            className="button secondary"
            onClick={() =>
              downloadText(
                text,
                'GenCompass-' +
                  (record.code || 'referral') +
                  '-направление.txt',
              )
            }
          >
            <Download size={16} />
            Скачать TXT
          </button>
          <button className="button primary" onClick={() => onPrint(text)}>
            <Printer size={16} />
            Печать / PDF
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
