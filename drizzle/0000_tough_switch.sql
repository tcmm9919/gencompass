CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `assessments_updated_at_idx` ON `assessments` (`updated_at`);