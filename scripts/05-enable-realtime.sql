/*
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

-- Enable Realtime replication for core tables
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE posts;
  ALTER PUBLICATION supabase_realtime ADD TABLE likes;
  ALTER PUBLICATION supabase_realtime ADD TABLE comments;
COMMIT;


