CREATE TABLE `gesloten_vragen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vraag_tekst` text NOT NULL,
	`type` enum('WAAR_NIET_WAAR','VIER_OPTIES') NOT NULL,
	`tijd_seconden` int NOT NULL,
	`optie_a` varchar(500) NOT NULL,
	`optie_b` varchar(500) NOT NULL,
	`optie_c` varchar(500),
	`optie_d` varchar(500),
	`correct_antwoord` varchar(1) NOT NULL,
	`vragen_set_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gesloten_vragen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`naam` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `vragen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vraag_tekst` text NOT NULL,
	`competentie` enum('KWALITEITEN','MOTIEVEN','WERK','STURING','NETWERKEN') NOT NULL,
	`tijd_seconden` int NOT NULL,
	`vragen_set_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vragen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vragen_sets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(200) NOT NULL,
	`user_id` int NOT NULL,
	`share_token` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vragen_sets_id` PRIMARY KEY(`id`),
	CONSTRAINT `vragen_sets_share_token_unique` UNIQUE(`share_token`)
);
--> statement-breakpoint
ALTER TABLE `gesloten_vragen` ADD CONSTRAINT `gesloten_vragen_vragen_set_id_vragen_sets_id_fk` FOREIGN KEY (`vragen_set_id`) REFERENCES `vragen_sets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vragen` ADD CONSTRAINT `vragen_vragen_set_id_vragen_sets_id_fk` FOREIGN KEY (`vragen_set_id`) REFERENCES `vragen_sets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vragen_sets` ADD CONSTRAINT `vragen_sets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;