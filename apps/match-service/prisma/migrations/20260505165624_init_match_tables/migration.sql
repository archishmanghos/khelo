-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('cricket', 'football', 'table_tennis');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('scheduled', 'live', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ParticipantType" AS ENUM ('team', 'player');

-- CreateEnum
CREATE TYPE "CricketFormat" AS ENUM ('t20', 'odi', 'test');

-- CreateEnum
CREATE TYPE "InningsStatus" AS ENUM ('in_progress', 'completed');

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "sport_type" "SportType" NOT NULL,
    "title" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'scheduled',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participants" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "participant_type" "ParticipantType" NOT NULL,
    "participant_id" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "match_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_players" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "team_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cricket_matches" (
    "match_id" TEXT NOT NULL,
    "format" "CricketFormat" NOT NULL,
    "total_overs" INTEGER NOT NULL,
    "current_innings" INTEGER NOT NULL DEFAULT 1,
    "toss_winner_team_id" TEXT,
    "toss_decision" TEXT,

    CONSTRAINT "cricket_matches_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "cricket_innings" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "innings_number" INTEGER NOT NULL,
    "batting_team_id" TEXT NOT NULL,
    "bowling_team_id" TEXT NOT NULL,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "overs" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "InningsStatus" NOT NULL DEFAULT 'in_progress',

    CONSTRAINT "cricket_innings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cricket_matches" ADD CONSTRAINT "cricket_matches_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cricket_innings" ADD CONSTRAINT "cricket_innings_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
