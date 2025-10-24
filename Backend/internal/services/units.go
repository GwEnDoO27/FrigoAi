package services

import (
	"fmt"
	"strings"
)

// ConvertToBaseUnit convertit une quantité vers l'unité de base
// Solides -> grammes (g)
// Liquides -> millilitres (mL)
func ConvertToBaseUnit(quantity float64, unit string) (float64, string, error) {
	unit = strings.ToLower(strings.TrimSpace(unit))

	// Unités de poids (base: grammes)
	weightUnits := map[string]float64{
		"g":  1.0,
		"kg": 1000.0,
		"mg": 0.001,
	}

	// Unités de volume (base: millilitres)
	volumeUnits := map[string]float64{
		"ml":  1.0,
		"cl":  10.0,
		"dl":  100.0,
		"l":   1000.0,
		"mL":  1.0, // Alternative notation
		"cL":  10.0,
		"dL":  100.0,
		"L":   1000.0,
	}

	// Unités de cuisine (approximations en grammes)
	kitchenUnits := map[string]float64{
		"cuillere a soupe":    15.0,  // ~15g ou 15mL
		"cuillere à soupe":    15.0,
		"cuillère a soupe":    15.0,
		"cuillère à soupe":    15.0,
		"c. a soupe":          15.0,
		"c. à soupe":          15.0,
		"cs":                  15.0,
		"cuillere a cafe":     5.0, // ~5g ou 5mL
		"cuillere à cafe":     5.0,
		"cuillère a cafe":     5.0,
		"cuillère à cafe":     5.0,
		"c. a cafe":           5.0,
		"c. à cafe":           5.0,
		"cc":                  5.0,
		"cuillère à café":     5.0,
		"cuillere a the":      5.0,
		"cuillere à the":      5.0,
		"cuillère a the":      5.0,
		"cuillère à the":      5.0,
		"cuillère à thé":      5.0,
		"tasse":               240.0, // ~240mL
		"verre":               200.0, // ~200mL
		"pincee":              1.0,
		"pincée":              1.0,
	}

	// Unités spéciales (pas de conversion, juste comptage)
	specialUnits := map[string]bool{
		"":        true, // Pas d'unité = unité
		"unite":   true,
		"unité":   true,
		"u":       true,
		"piece":   true,
		"pièce":   true,
		"tranche": true,
	}

	// Vérifier si c'est une unité spéciale (pas de conversion)
	if specialUnits[unit] {
		return quantity, "unité", nil
	}

	// Vérifier les unités de poids
	if factor, ok := weightUnits[unit]; ok {
		return quantity * factor, "g", nil
	}

	// Vérifier les unités de volume
	if factor, ok := volumeUnits[unit]; ok {
		return quantity * factor, "mL", nil
	}

	// Vérifier les unités de cuisine
	if factor, ok := kitchenUnits[unit]; ok {
		return quantity * factor, "g", nil // On approxime tout en grammes
	}

	// Unité inconnue, retourner tel quel
	fmt.Printf("Unité inconnue: '%s', pas de conversion\n", unit)
	return quantity, unit, nil
}

// CompareQuantities compare deux quantités avec leurs unités
// Retourne true si quantity1 >= quantity2 (après conversion)
func CompareQuantities(quantity1 float64, unit1 string, quantity2 float64, unit2 string) bool {
	// Convertir les deux quantités vers l'unité de base
	baseQty1, baseUnit1, err1 := ConvertToBaseUnit(quantity1, unit1)
	baseQty2, baseUnit2, err2 := ConvertToBaseUnit(quantity2, unit2)

	if err1 != nil || err2 != nil {
		// En cas d'erreur, comparaison simple
		return quantity1 >= quantity2
	}

	// Si les unités de base sont différentes (g vs mL), on ne peut pas comparer
	if baseUnit1 != baseUnit2 {
		fmt.Printf("Impossible de comparer %s et %s (types différents)\n", baseUnit1, baseUnit2)
		// Par défaut, on considère qu'on a assez
		return true
	}

	return baseQty1 >= baseQty2
}
