package services

import (
	"fmt"
	"strings"
)

func Find_Recettes() ([]map[string]any, error) {
	fmt.Println("=== Début Find_Recettes ===")

	// Récupérer tous les ingrédients disponibles
	ingredients, err := Select_Ingredients()
	if err != nil {
		return nil, fmt.Errorf("failed to get ingredients: %w", err)
	}

	fmt.Printf("Ingrédients récupérés de la DB: %+v\n", ingredients)

	// Extraire les noms des ingrédients disponibles avec conversion d'unités
	availableIngredientsMap := make(map[string]IngredientWithUnit)

	for _, ingredient := range ingredients {
		if name, ok := ingredient["Name"].(string); ok {
			if quantite, ok := ingredient["Quantite"].(float64); ok {
				unit := "g" // Par défaut
				if u, ok := ingredient["Unit"].(string); ok && u != "" {
					unit = u
				}

				// Normaliser le nom en minuscules pour la comparaison
				normalizedName := strings.ToLower(strings.TrimSpace(name))
				availableIngredientsMap[normalizedName] = IngredientWithUnit{
					Quantity: quantite,
					Unit:     unit,
				}
			}
		}
	}

	fmt.Printf("Ingrédients disponibles (normalisés): %+v\n", availableIngredientsMap)

	// Trouver les recettes correspondantes avec score
	matchedRecipes, err := GetRecipesByIngredients(availableIngredientsMap)
	if err != nil {
		return nil, fmt.Errorf("failed to match recipes: %w", err)
	}

	fmt.Printf("Recettes matchées avec score: %d résultats\n", len(matchedRecipes))
	return matchedRecipes, nil
}
