package services

type Recipes struct {
	Id          int                    `json:"recipe_id"`
	Name        string                 `json:"recipe_name"`
	Ingredients []RecipeIngredientItem `json:"recipe_ingredients"`
	Categorie   string                 `json:"categorie"`
	Livre       string                 `json:"book"`
}

// RecipeIngredientItem représente un ingrédient dans une recette (format frontend)
type RecipeIngredientItem struct {
	Id       int     `json:"id"`
	Name     string  `json:"ingre_name"`
	Quantite float32 `json:"ingre_qt"`
	Unit     string  `json:"ingre_unit"`
}

// IngredientRequest représente la requête d'ajout/update d'ingrédient (format frontend)
type IngredientRequest struct {
	Id       int     `json:"id"`
	Name     string  `json:"name"`
	Quantite float32 `json:"quantite"`
	Unit     string  `json:"unit"`
}
