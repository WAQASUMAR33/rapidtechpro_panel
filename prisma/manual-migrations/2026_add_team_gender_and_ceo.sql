-- Team members: gender-based placeholder avatars + CEO spotlight
ALTER TABLE `team_members`
  ADD COLUMN `gender` VARCHAR(191) NOT NULL DEFAULT 'male',
  ADD COLUMN `isCeo` BOOLEAN NOT NULL DEFAULT false,
  MODIFY COLUMN `image` VARCHAR(191) NULL;

-- Optional: mark the CEO (replace the name below)
-- UPDATE `team_members` SET `isCeo` = true WHERE `name` = 'Waqas';
