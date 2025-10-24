package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

func UploadsIngredients(w http.ResponseWriter, r *http.Request) {

	var resp IngredientRequest

	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		fmt.Printf("Erreur décodage JSON: %v\n", err)
		return
	}

	// Si pas d'unité fournie, utiliser 'g' par défaut
	if resp.Unit == "" {
		resp.Unit = "g"
	}

	fmt.Printf("Ingrédient reçu: ID=%d, Name='%s', Quantite=%f, Unit='%s'\n", resp.Id, resp.Name, resp.Quantite, resp.Unit)

	params := []string{"Id", "Name", "Quantite", "Unit"}
	values := []string{
		strconv.Itoa(resp.Id),
		resp.Name,
		strconv.FormatFloat(float64(resp.Quantite), 'f', -1, 32),
		resp.Unit,
	}

	fmt.Printf("Insertion DB avec params=%v, values=%v\n", params, values)

	err := InsertDb("Ingredients", params, values)

	if err != nil {
		http.Error(w, "Erreur Ajouts des Ingredients", http.StatusInternalServerError)
		fmt.Printf("Erreur insertion: %v\n", err)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Ingrédient ajouté avec succès"))
}

func NewRecipes(w http.ResponseWriter, r *http.Request) {
	var resp Recipes

	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	ingredientsJSON, err := json.Marshal(resp.Ingredients)
	if err != nil {
		http.Error(w, "Erreur de sérialisation des ingrédients", http.StatusInternalServerError)
		return
	}

	params := []string{"Id", "Name", "Ingredients", "Categorie", "Livre"}
	values := []string{
		strconv.Itoa(resp.Id),
		resp.Name,
		string(ingredientsJSON),
		resp.Categorie,
		resp.Livre,
	}

	err = InsertDb("Recipes", params, values)

	if err != nil {
		http.Error(w, "Erreur Ajouts de la Recette", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Recette ajoutée avec succès"))
}

func DeleteRecipes(w http.ResponseWriter, r *http.Request) {
	var resp Recipes

	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	params := []string{"Id"}
	values := []string{
		strconv.Itoa(resp.Id),
	}

	err := DeleteFromDB("Recipes", params, values)

	if err != nil {
		http.Error(w, "Erreur Suppression de la Recette", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Recette supprimée avec succès"))
}

func UpdateRecipesInfos(w http.ResponseWriter, r *http.Request) {
	var resp Recipes

	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	fmt.Printf("Recette reçue pour mise à jour: ID=%d, Name='%s'\n", resp.Id, resp.Name)

	ingredientsJSON, err := json.Marshal(resp.Ingredients)
	if err != nil {
		http.Error(w, "Erreur de sérialisation des ingrédients", http.StatusInternalServerError)
		return
	}

	// Paramètres à mettre à jour (sans l'Id)
	updateParams := []string{"Name", "Ingredients", "Categorie", "Livre"}
	updateValues := []string{
		resp.Name,
		string(ingredientsJSON),
		resp.Categorie,
		resp.Livre,
	}

	// Condition WHERE
	whereParams := []string{"Id"}
	whereValues := []string{strconv.Itoa(resp.Id)}

	fmt.Printf("UPDATE avec SET %v=%v WHERE %v=%v\n", updateParams, updateValues, whereParams, whereValues)

	err = UpdateDB("Recipes", updateParams, updateValues, whereParams, whereValues)

	if err != nil {
		http.Error(w, "Erreur mise a jour recette", http.StatusInternalServerError)
		fmt.Println("Erreur dans la mise à jour de la recette : ", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Recette mise a jour"))
}

func Display_recettes(w http.ResponseWriter, r *http.Request) {
	fmt.Println("=== API /proposition appelée ===")

	recipes, err := Find_Recettes()
	if err != nil {
		http.Error(w, "Impossible de trouver des correspondances", http.StatusInternalServerError)
		fmt.Println("Impossible de trouver une correspondance : ", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"recipes": recipes})
	fmt.Printf("=== Envoyé %d recettes au frontend ===\n", len(recipes))
}

func Get_all_recipes(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Début du chargement des recettes ... ")
	all_recipes, err := SelectFromDB("Recipes", []string{}, []string{}, []string{})
	if err != nil {
		http.Error(w, "Erreur lors de la recuperation des recettes", http.StatusInternalServerError)
		fmt.Println("Erreur dans le chargement des recipes : ", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"recipes": all_recipes})
	fmt.Println("Fin du chargement des recettes ... ")
}

func Get_all_ingredients(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Début du chargement des Ingredients ... ")
	all_igs, err := SelectFromDB("Ingredients", []string{}, []string{}, []string{})
	if err != nil {
		http.Error(w, "Erreur lors de la recuperation des recettes", http.StatusInternalServerError)
		fmt.Println("Erreur dans le chargement des Ingredients : ", err)
		return
	}

	fmt.Printf("Données récupérées : %+v\n", all_igs)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"ingredients": all_igs})
	fmt.Println("Fin du chargement des Ingredients ... ")
}

func DeleteIngredient(w http.ResponseWriter, r *http.Request) {
	var resp IngredientRequest

	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	params := []string{"Id"}
	values := []string{
		strconv.Itoa(resp.Id),
	}

	err := DeleteFromDB("Ingredients", params, values)

	if err != nil {
		http.Error(w, "Erreur Suppression de l'ingrédient", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Ingrédient supprimé avec succès"))
}

func UpdateIngredient(w http.ResponseWriter, r *http.Request) {
	var resp IngredientRequest

	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	// Si pas d'unité fournie, utiliser 'g' par défaut
	if resp.Unit == "" {
		resp.Unit = "g"
	}

	params := []string{"Name", "Quantite", "Unit"}
	values := []string{
		resp.Name,
		strconv.FormatFloat(float64(resp.Quantite), 'f', -1, 32),
		resp.Unit,
	}

	whereParams := []string{"Id"}
	whereValues := []string{strconv.Itoa(resp.Id)}

	err := UpdateDB("Ingredients", params, values, whereParams, whereValues)

	if err != nil {
		http.Error(w, "Erreur mise à jour ingrédient", http.StatusInternalServerError)
		fmt.Println("Erreur dans la mise à jour de l'ingrédient : ", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Ingrédient mis à jour"))
}
