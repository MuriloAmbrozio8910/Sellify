ALTER TABLE guild_configs
ADD COLUMN theme_primary_color TEXT DEFAULT '#5865F2',
ADD COLUMN theme_success_color TEXT DEFAULT '#57F287',
ADD COLUMN theme_danger_color TEXT DEFAULT '#ED4245';