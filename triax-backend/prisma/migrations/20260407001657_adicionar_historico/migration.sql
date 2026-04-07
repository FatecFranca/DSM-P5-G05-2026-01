-- CreateTable
CREATE TABLE "Historico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "pa" TEXT NOT NULL,
    "temp" TEXT NOT NULL,
    "sat" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "iaScore" INTEGER NOT NULL,
    "dataAlta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
