package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

func InsertDb(table string, params []string, values []string) error {
	db, err := openDb()
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	if len(params) != len(values) {
		return fmt.Errorf("params and values slices must have the same length")
	}

	param_str := strings.Join(params, ",")
	placeholders := make([]string, len(values))
	for i := range placeholders {
		placeholders[i] = "?"
	}
	values_str := strings.Join(placeholders, ",")

	format_stmt := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", table, param_str, values_str)

	stmt, err := db.Prepare(format_stmt)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	interfaces := make([]any, len(values))
	for i, v := range values {
		interfaces[i] = v
	}

	_, err = stmt.Exec(interfaces...)
	if err != nil {
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	return nil
}

func SelectFromDB(table string, columns []string, whereColumns []string, whereValues []string) ([]map[string]any, error) {
	fmt.Println("Début du select ....")
	db, err := openDb()
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	if len(whereColumns) != len(whereValues) {
		return nil, fmt.Errorf("whereColumns and whereValues slices must have the same length")
	}

	columnsStr := "*"
	if len(columns) > 0 {
		columnsStr = strings.Join(columns, ", ")
	}

	var query string
	var interfaces []any

	if len(whereColumns) > 0 {
		whereConditions := make([]string, len(whereColumns))
		for i, col := range whereColumns {
			whereConditions[i] = fmt.Sprintf("%s = ?", col)
		}
		whereStr := strings.Join(whereConditions, " AND ")
		query = fmt.Sprintf("SELECT %s FROM %s WHERE %s", columnsStr, table, whereStr)

		interfaces = make([]any, len(whereValues))
		for i, v := range whereValues {
			interfaces[i] = v
		}
	} else {
		query = fmt.Sprintf("SELECT %s FROM %s", columnsStr, table)
	}

	rows, err := db.Query(query, interfaces...)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	var results []map[string]any
	for rows.Next() {
		values := make([]any, len(cols))
		valuePtrs := make([]any, len(cols))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		rowMap := make(map[string]any)
		for i, col := range cols {
			if values[i] != nil {
				rowMap[col] = values[i]
			}
		}
		results = append(results, rowMap)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return results, nil
}

func DeleteFromDB(table string, whereColumns []string, whereValues []string) error {
	db, err := openDb()
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	if len(whereColumns) != len(whereValues) {
		return fmt.Errorf("whereColumns and whereValues slices must have the same length")
	}

	if len(whereColumns) == 0 {
		return fmt.Errorf("at least one WHERE condition is required for DELETE operation")
	}

	whereConditions := make([]string, len(whereColumns))
	for i, col := range whereColumns {
		whereConditions[i] = fmt.Sprintf("%s = ?", col)
	}
	whereStr := strings.Join(whereConditions, " AND ")

	query := fmt.Sprintf("DELETE FROM %s WHERE %s", table, whereStr)

	stmt, err := db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	interfaces := make([]any, len(whereValues))
	for i, v := range whereValues {
		interfaces[i] = v
	}

	result, err := stmt.Exec(interfaces...)
	if err != nil {
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no rows were deleted")
	}

	return nil
}

func UpdateDB(table string, updateColumns []string, updateValues []string, whereColumns []string, whereValues []string) error {
	db, err := openDb()
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	if len(updateColumns) != len(updateValues) {
		return fmt.Errorf("updateColumns and updateValues slices must have the same length")
	}

	if len(whereColumns) != len(whereValues) {
		return fmt.Errorf("whereColumns and whereValues slices must have the same length")
	}

	if len(updateColumns) == 0 {
		return fmt.Errorf("at least one column to update is required")
	}

	if len(whereColumns) == 0 {
		return fmt.Errorf("at least one WHERE condition is required for UPDATE operation")
	}

	setConditions := make([]string, len(updateColumns))
	for i, col := range updateColumns {
		setConditions[i] = fmt.Sprintf("%s = ?", col)
	}
	setStr := strings.Join(setConditions, ", ")

	whereConditions := make([]string, len(whereColumns))
	for i, col := range whereColumns {
		whereConditions[i] = fmt.Sprintf("%s = ?", col)
	}
	whereStr := strings.Join(whereConditions, " AND ")

	query := fmt.Sprintf("UPDATE %s SET %s WHERE %s", table, setStr, whereStr)

	stmt, err := db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	allValues := make([]any, 0, len(updateValues)+len(whereValues))
	for _, v := range updateValues {
		allValues = append(allValues, v)
	}
	for _, v := range whereValues {
		allValues = append(allValues, v)
	}

	result, err := stmt.Exec(allValues...)
	if err != nil {
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no rows were updated")
	}

	return nil
}

func openDb() (*sql.DB, error) {
	DB_PATH := "./db/db.sqlite"

	// Vérifier si le fichier existe
	if _, err := os.Stat(DB_PATH); os.IsNotExist(err) {
		fmt.Printf("ATTENTION: Le fichier de base de données n'existe pas à %s\n", DB_PATH)
		return nil, fmt.Errorf("database file does not exist at %s", DB_PATH)
	}

	db, err := sql.Open("sqlite3", DB_PATH)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

func Select_Recipes() ([]map[string]any, error) {
	db, err := openDb()
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	query := "SELECT * FROM Recipes"

	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	var results []map[string]any
	for rows.Next() {
		values := make([]any, len(cols))
		valuePtrs := make([]any, len(cols))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		rowMap := make(map[string]any)
		for i, col := range cols {
			if values[i] != nil {
				rowMap[col] = values[i]
			}
		}
		results = append(results, rowMap)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return results, nil
}

func Select_Ingredients() ([]map[string]any, error) {
	db, err := openDb()
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	query := "SELECT * FROM Ingredients"

	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	var results []map[string]any
	for rows.Next() {
		values := make([]any, len(cols))
		valuePtrs := make([]any, len(cols))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		rowMap := make(map[string]any)
		for i, col := range cols {
			if values[i] != nil {
				rowMap[col] = values[i]
			}
		}
		results = append(results, rowMap)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return results, nil
}

// RecipeIngredient représente un ingrédient dans une recette (pour parsing JSON)
type RecipeIngredient struct {
	ID       int     `json:"id"`
	Name     string  `json:"ingre_name"`
	Quantite float64 `json:"ingre_qt"`
	Unit     string  `json:"ingre_unit"`
}

// IngredientWithUnit représente un ingrédient avec son unité
type IngredientWithUnit struct {
	Quantity float64
	Unit     string
}

func GetRecipesByIngredients(availableIngredients map[string]IngredientWithUnit) ([]map[string]any, error) {
	fmt.Println("=== Début GetRecipesByIngredients ===")

	// Récupérer toutes les recettes
	allRecipes, err := Select_Recipes()
	if err != nil {
		return nil, fmt.Errorf("failed to get recipes: %w", err)
	}

	fmt.Printf("Nombre total de recettes: %d\n", len(allRecipes))

	var matchedRecipes []map[string]any

	// Pour chaque recette, calculer le score de matching
	for _, recipe := range allRecipes {
		ingredientsJSON, ok := recipe["Ingredients"].(string)
		if !ok {
			fmt.Printf("Recette %v: pas de champ Ingredients\n", recipe["Name"])
			continue
		}

		// Parser les ingrédients de la recette
		var recipeIngredients []RecipeIngredient
		if err := json.Unmarshal([]byte(ingredientsJSON), &recipeIngredients); err != nil {
			fmt.Printf("Erreur parsing ingredients pour recette %v: %v\n", recipe["Name"], err)
			continue
		}

		if len(recipeIngredients) == 0 {
			continue
		}

		// Calculer le score: nombre d'ingrédients qu'on a / nombre d'ingrédients requis
		matchCount := 0
		missingIngredients := []string{}
		availableRecipeIngredients := []string{}

		for _, recipeIng := range recipeIngredients {
			ingredientName := strings.ToLower(strings.TrimSpace(recipeIng.Name))

			// Unité par défaut si non spécifiée
			recipeUnit := recipeIng.Unit
			if recipeUnit == "" {
				recipeUnit = "g"
			}

			if availIng, exists := availableIngredients[ingredientName]; exists {
				// Comparer les quantités avec conversion d'unités
				hasEnough := CompareQuantities(
					availIng.Quantity,
					availIng.Unit,
					recipeIng.Quantite,
					recipeUnit,
				)

				if hasEnough {
					matchCount++
					availableRecipeIngredients = append(availableRecipeIngredients, recipeIng.Name)
				} else {
					missingIngredients = append(missingIngredients, recipeIng.Name)
				}
			} else {
				missingIngredients = append(missingIngredients, recipeIng.Name)
			}
		}

		score := float64(matchCount) / float64(len(recipeIngredients))

		fmt.Printf("Recette '%v': score=%.2f (%d/%d ingrédients)\n",
			recipe["Name"], score, matchCount, len(recipeIngredients))

		// Créer une copie de la recette avec les infos supplémentaires
		enrichedRecipe := make(map[string]any)
		for k, v := range recipe {
			enrichedRecipe[k] = v
		}
		enrichedRecipe["score"] = score
		enrichedRecipe["matched_ingredients_count"] = matchCount
		enrichedRecipe["total_ingredients_count"] = len(recipeIngredients)
		enrichedRecipe["missing_ingredients"] = missingIngredients
		enrichedRecipe["available_ingredients"] = availableRecipeIngredients

		matchedRecipes = append(matchedRecipes, enrichedRecipe)
	}

	// Trier par score décroissant (les meilleures recettes en premier)
	for i := 0; i < len(matchedRecipes); i++ {
		for j := i + 1; j < len(matchedRecipes); j++ {
			scoreI := matchedRecipes[i]["score"].(float64)
			scoreJ := matchedRecipes[j]["score"].(float64)
			if scoreJ > scoreI {
				matchedRecipes[i], matchedRecipes[j] = matchedRecipes[j], matchedRecipes[i]
			}
		}
	}

	return matchedRecipes, nil
}
