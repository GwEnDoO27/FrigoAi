
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';

// Structure des recettes retournées par la DB
interface RecipeFromDB {
    ID: number;
    Name: string;
    Ingredients: string; // JSON string
    Categorie: string;
    Livre: string;
    score?: number;
    matched_ingredients_count?: number;
    total_ingredients_count?: number;
    missing_ingredients?: string[];
    available_ingredients?: string[];
}

interface Ingredient {
    id: number;
    ingre_name: string;
    ingre_qt: number;
    ingre_unit?: string;
}

export function RecipeList() {
    const [recipes, setRecipes] = useState<RecipeFromDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch('http://localhost:8001/api/proposition');
                if (!response.ok) {
                    throw new Error('Failed to fetch recipes');
                }
                const data = await response.json();
                console.log("Données reçues de l'API:", data);
                // L'API renvoie {recipes: recipes} pour /api/proposition
                setRecipes(data.recipes || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error("Erreur lors du fetch:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    if (loading) return <div className="text-center py-12 text-gray-600">Chargement des recettes...</div>;
    if (error) return <div className="text-center py-12 text-red-600">Erreur: {error}</div>;

    if (recipes.length === 0 && !loading) {
        return <div className="text-center py-12 text-gray-600">Aucune recette disponible</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => {
                    let ingredients: Ingredient[] = [];
                    try {
                        ingredients = JSON.parse(recipe.Ingredients);
                    } catch (e) {
                        console.error("Erreur parsing ingredients:", e);
                    }

                    const scorePercent = recipe.score ? Math.round(recipe.score * 100) : 0;
                    const canMake = recipe.score === 1;

                    return (
                        <Card
                            key={recipe.ID}
                            className={`backdrop-blur-md border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                                canMake
                                    ? 'bg-green-50/50 border-green-200'
                                    : 'bg-white/30 border-white/20'
                            }`}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-gray-900">{recipe.Name}</CardTitle>
                                    {recipe.score !== undefined && (
                                        <div className={`text-xs font-bold px-2 py-1 rounded ${
                                            canMake ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                                        }`}>
                                            {scorePercent}%
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-gray-700 font-medium">
                                    {recipe.Categorie} • {recipe.Livre}
                                </div>
                                {recipe.matched_ingredients_count !== undefined && (
                                    <div className="text-xs text-gray-600 mt-1">
                                        {recipe.matched_ingredients_count}/{recipe.total_ingredients_count} ingrédients disponibles
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                <h4 className="font-semibold mb-2 text-gray-900">Ingrédients:</h4>
                                <ul className="space-y-1">
                                    {ingredients.length > 0 ? (
                                        ingredients.map((ingredient, idx) => {
                                            const isAvailable = recipe.available_ingredients?.includes(ingredient.ingre_name);
                                            return (
                                                <li
                                                    key={idx}
                                                    className={`text-sm ${
                                                        isAvailable ? 'text-green-700 font-medium' : 'text-gray-500 line-through'
                                                    }`}
                                                >
                                                    {ingredient.ingre_name}: {ingredient.ingre_qt} {ingredient.ingre_unit || 'g'}
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li className="text-sm text-gray-400">Aucun ingrédient</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
