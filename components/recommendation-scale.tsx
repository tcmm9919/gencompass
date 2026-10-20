'use client';

import { useId } from 'react';
import { Circle } from 'lucide-react';
import { Grid } from '@astryxdesign/core/Grid';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { IconButton } from '@astryxdesign/core/IconButton';
import { useTheme } from '@astryxdesign/core/theme';
import {
  recommendationLevels,
  provisionalThresholdsNote,
  type recommendationFor,
} from '@/lib/recommendation';

type Recommendation = ReturnType<typeof recommendationFor>;

/** SVG coordinates describe data, while layout and appearance use Astryx tokens. */
export function RecommendationScale({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const gradientId = useId();
  const { token } = useTheme();
  const colors = [
    '--color-data-shamrock-3',
    '--color-data-teal-3',
    '--color-data-neutral',
    '--color-data-orange-3',
    '--color-data-red-3',
  ];
  const score = recommendation.score;
  // Centers of five equal legend columns: 10%, 30%, 50%, 70%, 90%.
  const position = (value: number) => `${10 + value * 0.8}%`;
  return (
    <VStack gap={2} aria-label="Рекомендация консультации генетика">
      <Text weight="medium">Рекомендация консультации генетика</Text>
      <VStack className="relative">
        <svg
          className="w-full h-10 overflow-visible"
          aria-label={
            score === null
              ? 'Шкала: рекомендация не рассчитана'
              : `Индекс ${score} из 100. ${recommendation.label}`
          }
        >
          <defs>
            <linearGradient id={gradientId}>
              {colors.map((color, i) => (
                <stop
                  key={color}
                  offset={`${i * 25}%`}
                  stopColor={token(color)}
                />
              ))}
            </linearGradient>
          </defs>
          <rect
            x="10%"
            y="40%"
            width="80%"
            height="20%"
            rx="1%"
            fill={`url(#${gradientId})`}
          />
          {recommendationLevels.map((label, index) => (
            <circle
              key={label}
              cx={position(index * 25)}
              cy="50%"
              r={token('--spacing-1')}
              fill={token('--color-background-surface')}
              stroke={token('--color-border')}
            />
          ))}
        </svg>
        {score !== null && (
          <VStack
            width={position(score)}
            justify="center"
            align="end"
            className="absolute inset-y-0 left-0"
          >
            <Tooltip
              placement="above"
              touchTrigger="tap"
              focusTrigger="always"
              hasHoverIndication={false}
              content={
                <VStack gap={1}>
                  <Text type="supporting" color="inherit">
                    Рекомендация
                  </Text>
                  <Text type="large" color="inherit" weight="semibold">
                    {recommendation.label}
                  </Text>
                </VStack>
              }
            >
              <IconButton
                label={`Индекс ${score} из 100. Рекомендация: ${recommendation.label}`}
                icon={<Circle className="size-5 fill-surface text-primary" />}
                variant="ghost"
                className="translate-x-1/2"
                size="lg"
              />
            </Tooltip>
          </VStack>
        )}
      </VStack>
      <Grid columns={5} gap={1}>
        {recommendationLevels.map((label, index) => (
          <Text
            key={label}
            type="supporting"
            justify="center"
            textWrap="balance"
            weight={recommendation.level === index ? 'semibold' : 'normal'}
          >
            {label
              .replace('Пограничная', 'Погра\u00adничная')
              .replace('Рекомендована', 'Рекомен\u00adдована')}
          </Text>
        ))}
      </Grid>
      {recommendation.thresholdsProvisional && (
        <Text type="supporting">{provisionalThresholdsNote}</Text>
      )}
      {score !== null && recommendation.level === null && (
        <Text type="supporting">
          Границы новых уровней ожидают утверждения. Маркер показывает
          рассчитанный демо-индекс.
        </Text>
      )}
    </VStack>
  );
}
