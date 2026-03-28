-- CreateTable
CREATE TABLE "Triagem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "pa" TEXT NOT NULL,
    "temp" TEXT NOT NULL,
    "sat" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "iaScore" INTEGER NOT NULL,
    "espera" TEXT NOT NULL DEFAULT '0 min',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
