package frigoassistant

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func CreateDb() {
	DB_PATH := "./db/db.sqlite"

	// Créer le fichier s'il n'existe pas
	if _, err := os.Stat(DB_PATH); os.IsNotExist(err) {
		file, err := os.Create(DB_PATH)
		if err != nil {
			fmt.Printf("Erreur lors de la création du fichier de base de données : %v\n", err)
			return
		}
		file.Close()
		fmt.Println("Fichier de base de données créé")
	}

	db, err := sql.Open("sqlite3", DB_PATH)
	if err != nil {
		fmt.Printf("Erreur lors de l'ouverture de la base de données : %v\n", err)
		return
	}
	defer db.Close()

	// Vérifier la connexion
	if err := db.Ping(); err != nil {
		fmt.Printf("Erreur lors de la connexion à la base de données : %v\n", err)
		return
	}

	r := `
	CREATE TABLE IF NOT EXISTS Recipes (
		ID INTEGER PRIMARY KEY AUTOINCREMENT,
		Name VARCHAR(40) NOT NULL,
		Ingredients TEXT NOT NULL,
		Categorie VARCHAR(30) NOT NULL,
		Livre VARCHAR(30) NOT NULL
	);
	CREATE TABLE IF NOT EXISTS Ingredients (
		ID INTEGER PRIMARY KEY AUTOINCREMENT,
		Name VARCHAR(40) NOT NULL,
		Quantite FLOAT NOT NULL,
		Unit VARCHAR(20) DEFAULT 'g'
	);
	`

	_, err = db.Exec(r)
	if err != nil {
		fmt.Printf("Erreur lors de la création des tables : %v\n", err)
		return
	}

	// Migration: Ajouter la colonne Unit si elle n'existe pas déjà (pour les DB existantes)
	migrationSQL := `ALTER TABLE Ingredients ADD COLUMN Unit VARCHAR(20) DEFAULT 'g';`
	_, _ = db.Exec(migrationSQL) // Ignore les erreurs si la colonne existe déjà

	fmt.Println("Base de données initialisée avec succès")
}
