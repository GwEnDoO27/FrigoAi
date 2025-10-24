package main

import (
	frigoassistant "fa/internal"
	"fa/internal/services"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	// Afficher le répertoire de travail actuel
	dir, err := os.Getwd()
	if err != nil {
		fmt.Printf("Erreur lors de la récupération du répertoire: %v\n", err)
	}
	fmt.Printf("Répertoire de travail actuel: %s\n", dir)

	// Créer le dossier db s'il n'existe pas
	if err := os.MkdirAll("./db", 0755); err != nil {
		fmt.Printf("Erreur lors de la création du dossier db: %v\n", err)
	} else {
		fmt.Println("Dossier ./db vérifié/créé")
	}

	// Toujours appeler CreateDb pour s'assurer que les tables existent
	fmt.Println("Initialisation de la base de données...")
	frigoassistant.CreateDb()
	fmt.Println("Base de données initialisée")

	r := mux.NewRouter()
	r.Use(services.CORS)

	api := r.PathPrefix("/api").Subrouter()

	api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})
	api.HandleFunc("/add-ingredients", services.UploadsIngredients)
	api.HandleFunc("/delete-ingredient", services.DeleteIngredient)
	api.HandleFunc("/update-ingredient", services.UpdateIngredient)

	api.HandleFunc("/add-recipe", services.NewRecipes)
	api.HandleFunc("/delete-recipe", services.DeleteRecipes)
	api.HandleFunc("/update-recipes", services.UpdateRecipesInfos)

	api.HandleFunc("/proposition", services.Display_recettes)

	api.HandleFunc("/all-recipes", services.Get_all_recipes)

	api.HandleFunc("/all-ingredients", services.Get_all_ingredients)

	fmt.Println("Serveur lancé sur : http://localhost:8001/")
	http.ListenAndServe(":8001", r)
}
