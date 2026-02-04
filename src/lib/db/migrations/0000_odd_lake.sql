CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blips` (
	`id` text PRIMARY KEY NOT NULL,
	`radarId` text NOT NULL,
	`quadrantId` text NOT NULL,
	`ringId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`isNew` integer DEFAULT true NOT NULL,
	`offsetX` real DEFAULT 0.5 NOT NULL,
	`offsetY` real DEFAULT 0.5 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`radarId`) REFERENCES `radars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quadrantId`) REFERENCES `quadrants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ringId`) REFERENCES `rings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quadrants` (
	`id` text PRIMARY KEY NOT NULL,
	`radarId` text NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`color` text NOT NULL,
	FOREIGN KEY (`radarId`) REFERENCES `radars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `radars` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rings` (
	`id` text PRIMARY KEY NOT NULL,
	`radarId` text NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`opacity` real NOT NULL,
	FOREIGN KEY (`radarId`) REFERENCES `radars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_sessionToken_unique` ON `sessions` (`sessionToken`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`passwordHash` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verificationTokens_token_unique` ON `verificationTokens` (`token`);