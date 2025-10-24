'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Apple, ArrowLeft, ChefHat, Edit, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Ingredient {
  id: number;
  ingre_name: string;
  ingre_qt: number;
  ingre_unit?: string;
}

interface IngredientFromDB {
  ID: number;
  Name: string;
  Quantite: number;
  Unit?: string;
}

interface RecipeFromDB {
  ID: number;
  Name: string;
  Ingredients: string;
  Categorie: string;
  Livre: string;
}

export default function AddRecipe() {
  const router = useRouter();

  // Recipe states
  const [recipeName, setRecipeName] = useState("");
  const [categorie, setCategorie] = useState("");
  const [livre, setLivre] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "", unit: "g" });
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeFromDB[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [recipeSheetOpen, setRecipeSheetOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeFromDB | null>(null);
  const [editRecipeSheetOpen, setEditRecipeSheetOpen] = useState(false);
  const [editRecipeIngredients, setEditRecipeIngredients] = useState<Ingredient[]>([]);
  const [editNewIngredient, setEditNewIngredient] = useState({ name: "", quantity: "", unit: "g" });

  // Ingredient states
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [ingredientUnit, setIngredientUnit] = useState("g");
  const [loadingIngredient, setLoadingIngredient] = useState(false);
  const [ingredientsList, setIngredientsList] = useState<IngredientFromDB[]>([]);
  const [loadingIngredientsList, setLoadingIngredientsList] = useState(false);
  const [ingredientSheetOpen, setIngredientSheetOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<IngredientFromDB | null>(null);
  const [editIngredientSheetOpen, setEditIngredientSheetOpen] = useState(false);

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity) {
      setIngredients([
        ...ingredients,
        {
          id: Date.now(),
          ingre_name: newIngredient.name,
          ingre_qt: parseFloat(newIngredient.quantity),
          ingre_unit: newIngredient.unit,
        },
      ]);
      setNewIngredient({ name: "", quantity: "", unit: "g" });
    }
  };

  const removeIngredient = (id: number) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleSubmitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8001/api/add-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipe_id: Date.now(),
          recipe_name: recipeName,
          recipe_ingredients: ingredients,
          categorie: categorie,
          book: livre,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la recette");
      }

      await get_recipes();

      setRecipeName("");
      setCategorie("");
      setLivre("");
      setIngredients([]);
      setRecipeSheetOpen(false);

      alert("Recette ajoutée avec succès!");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout de la recette");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIngredient(true);

    try {
      const response = await fetch("http://localhost:8001/api/add-ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Date.now(),
          name: ingredientName,
          quantite: parseFloat(ingredientQuantity),
          unit: ingredientUnit,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'ingrédient");
      }

      await get_ingredients();

      setIngredientName("");
      setIngredientQuantity("");
      setIngredientUnit("g");
      setIngredientSheetOpen(false);

      alert("Ingrédient ajouté avec succès!");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout de l'ingrédient");
    } finally {
      setLoadingIngredient(false);
    }
  };

  const get_recipes = async () => {
    setLoadingRecipes(true);
    try {
      const all_recipes = await fetch("http://localhost:8001/api/all-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!all_recipes.ok) {
        throw new Error(`Response status: ${all_recipes.status}`);
      }
      const data = await all_recipes.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const get_ingredients = async () => {
    setLoadingIngredientsList(true);
    try {
      const response = await fetch("http://localhost:8001/api/all-ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Données reçues de l'API:", data);
      console.log("Liste des ingrédients:", data.ingredients);
      setIngredientsList(data.ingredients || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingIngredientsList(false);
    }
  };

  const handleDeleteIngredient = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet ingrédient ?")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:8001/api/delete-ingredient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'ingrédient");
      }

      await get_ingredients();
      alert("Ingrédient supprimé avec succès!");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de l'ingrédient");
    }
  };

  const handleEditIngredient = (ingredient: IngredientFromDB) => {
    setEditingIngredient(ingredient);
    setEditIngredientSheetOpen(true);
  };

  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIngredient) return;

    try {
      const response = await fetch("http://localhost:8001/api/update-ingredient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingIngredient.ID,
          name: editingIngredient.Name,
          quantite: editingIngredient.Quantite,
          unit: editingIngredient.Unit || "g",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'ingrédient");
      }

      await get_ingredients();
      setEditIngredientSheetOpen(false);
      setEditingIngredient(null);
      alert("Ingrédient mis à jour avec succès!");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour de l'ingrédient");
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:8001/api/delete-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipe_id: id }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la recette");
      }

      await get_recipes();
      alert("Recette supprimée avec succès!");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de la recette");
    }
  };

  const handleEditRecipe = (recipe: RecipeFromDB) => {
    setEditingRecipe(recipe);
    let parsedIngredients: Ingredient[] = [];
    try {
      parsedIngredients = JSON.parse(recipe.Ingredients);
    } catch (e) {
      console.error("Erreur parsing ingredients:", e);
    }
    setEditRecipeIngredients(parsedIngredients);
    setEditRecipeSheetOpen(true);
  };

  const addEditIngredient = () => {
    if (editNewIngredient.name && editNewIngredient.quantity) {
      setEditRecipeIngredients([
        ...editRecipeIngredients,
        {
          id: Date.now(),
          ingre_name: editNewIngredient.name,
          ingre_qt: parseFloat(editNewIngredient.quantity),
          ingre_unit: editNewIngredient.unit,
        },
      ]);
      setEditNewIngredient({ name: "", quantity: "", unit: "g" });
    }
  };

  const removeEditIngredient = (id: number) => {
    setEditRecipeIngredients(editRecipeIngredients.filter((ing) => ing.id !== id));
  };

  const handleUpdateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;

    try {
      const response = await fetch("http://localhost:8001/api/update-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipe_id: editingRecipe.ID,
          recipe_name: editingRecipe.Name,
          recipe_ingredients: editRecipeIngredients,
          categorie: editingRecipe.Categorie,
          book: editingRecipe.Livre,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la recette");
      }

      await get_recipes();
      setEditRecipeSheetOpen(false);
      setEditingRecipe(null);
      setEditRecipeIngredients([]);
      alert("Recette mise à jour avec succès!");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour de la recette");
    }
  };

  useEffect(() => {
    get_recipes();
    get_ingredients();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="backdrop-blur-md bg-white/30 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Gestion</h1>
          </div>
          <div className="flex gap-2">
            <Sheet open={ingredientSheetOpen} onOpenChange={setIngredientSheetOpen}>
              <SheetTrigger asChild>
                <Button className="gap-2 backdrop-blur-sm bg-green-500/80 hover:bg-green-600/80">
                  <Apple className="h-4 w-4" />
                  Ajouter un ingrédient
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[700px] sm:max-w-[700px]">
                <SheetHeader>
                  <SheetTitle>Nouvel ingrédient</SheetTitle>
                  <SheetDescription>
                    Ajoutez un nouvel ingrédient à votre inventaire
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmitIngredient} className="space-y-6 mt-6 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-name">Nom de l&apos;ingrédient</Label>
                    <Input
                      id="ingredient-name"
                      value={ingredientName}
                      onChange={(e) => setIngredientName(e.target.value)}
                      required
                      placeholder="Ex: Tomates"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-quantity">Quantité</Label>
                    <Input
                      id="ingredient-quantity"
                      type="number"
                      step="0.01"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(e.target.value)}
                      required
                      placeholder="Ex: 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-unit">Unité</Label>
                    <select
                      id="ingredient-unit"
                      value={ingredientUnit}
                      onChange={(e) => setIngredientUnit(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <optgroup label="Poids">
                        <option value="g">grammes (g)</option>
                        <option value="kg">kilogrammes (kg)</option>
                      </optgroup>
                      <optgroup label="Volume">
                        <option value="mL">millilitres (mL)</option>
                        <option value="cL">centilitres (cL)</option>
                        <option value="L">litres (L)</option>
                      </optgroup>
                      <optgroup label="Cuisine">
                        <option value="cuillère à soupe">cuillère à soupe</option>
                        <option value="cuillère à café">cuillère à café</option>
                        <option value="tasse">tasse</option>
                        <option value="verre">verre</option>
                      </optgroup>
                      <optgroup label="Autres">
                        <option value="unité">unité(s)</option>
                        <option value="pincée">pincée</option>
                      </optgroup>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    disabled={loadingIngredient}
                    className="w-full"
                  >
                    {loadingIngredient ? "Ajout en cours..." : "Ajouter l'ingrédient"}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>

            <Sheet open={editIngredientSheetOpen} onOpenChange={setEditIngredientSheetOpen}>
              <SheetContent className="w-full sm:w-[700px] sm:max-w-[700px]">
                <SheetHeader>
                  <SheetTitle>Modifier l&apos;ingrédient</SheetTitle>
                  <SheetDescription>
                    Modifiez les informations de l&apos;ingrédient
                  </SheetDescription>
                </SheetHeader>
                {editingIngredient && (
                  <form onSubmit={handleUpdateIngredient} className="space-y-6 mt-6 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-ingredient-name">Nom de l&apos;ingrédient</Label>
                      <Input
                        id="edit-ingredient-name"
                        value={editingIngredient.Name}
                        onChange={(e) => setEditingIngredient({ ...editingIngredient, Name: e.target.value })}
                        required
                        placeholder="Ex: Tomates"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ingredient-quantity">Quantité</Label>
                      <Input
                        id="edit-ingredient-quantity"
                        type="number"
                        step="0.01"
                        value={editingIngredient.Quantite}
                        onChange={(e) => setEditingIngredient({ ...editingIngredient, Quantite: parseFloat(e.target.value) })}
                        required
                        placeholder="Ex: 500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-ingredient-unit">Unité</Label>
                      <select
                        id="edit-ingredient-unit"
                        value={editingIngredient.Unit || "g"}
                        onChange={(e) => setEditingIngredient({ ...editingIngredient, Unit: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <optgroup label="Poids">
                          <option value="g">grammes (g)</option>
                          <option value="kg">kilogrammes (kg)</option>
                        </optgroup>
                        <optgroup label="Volume">
                          <option value="mL">millilitres (mL)</option>
                          <option value="cL">centilitres (cL)</option>
                          <option value="L">litres (L)</option>
                        </optgroup>
                        <optgroup label="Cuisine">
                          <option value="cuillère à soupe">cuillère à soupe</option>
                          <option value="cuillère à café">cuillère à café</option>
                          <option value="tasse">tasse</option>
                          <option value="verre">verre</option>
                        </optgroup>
                        <optgroup label="Autres">
                          <option value="unité">unité(s)</option>
                          <option value="pincée">pincée</option>
                        </optgroup>
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Mettre à jour l&apos;ingrédient
                    </Button>
                  </form>
                )}
              </SheetContent>
            </Sheet>

            <Sheet open={recipeSheetOpen} onOpenChange={setRecipeSheetOpen}>
              <SheetTrigger asChild>
                <Button className="gap-2 backdrop-blur-sm bg-blue-500/80 hover:bg-blue-600/80">
                  <ChefHat className="h-4 w-4" />
                  Ajouter une recette
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[800px] sm:max-w-[800px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Nouvelle recette</SheetTitle>
                  <SheetDescription>
                    Créez une nouvelle recette avec ses ingrédients
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmitRecipe} className="space-y-6 mt-6 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la recette</Label>
                    <Input
                      id="name"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      required
                      placeholder="Ex: Pasta Carbonara"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Input
                      id="categorie"
                      value={categorie}
                      onChange={(e) => setCategorie(e.target.value)}
                      required
                      placeholder="Ex: Plat principal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="livre">Livre</Label>
                    <Input
                      id="livre"
                      value={livre}
                      onChange={(e) => setLivre(e.target.value)}
                      required
                      placeholder="Ex: Cuisine Italienne"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Ingrédients</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nom de l'ingrédient"
                        value={newIngredient.name}
                        onChange={(e) =>
                          setNewIngredient({ ...newIngredient, name: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Quantité"
                        value={newIngredient.quantity}
                        onChange={(e) =>
                          setNewIngredient({ ...newIngredient, quantity: e.target.value })
                        }
                        className="w-24"
                      />
                      <select
                        value={newIngredient.unit}
                        onChange={(e) =>
                          setNewIngredient({ ...newIngredient, unit: e.target.value })
                        }
                        className="h-10 rounded-md border border-input bg-background px-2 text-sm w-20"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="mL">mL</option>
                        <option value="cL">cL</option>
                        <option value="L">L</option>
                        <option value="cuillère à soupe">c.s</option>
                        <option value="cuillère à café">c.c</option>
                        <option value="tasse">tasse</option>
                        <option value="verre">verre</option>
                        <option value="unité">unité</option>
                        <option value="pincée">pincée</option>
                      </select>
                      <Button type="button" onClick={addIngredient} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {ingredients.length > 0 && (
                      <ul className="space-y-2 mt-4">
                        {ingredients.map((ing) => (
                          <li
                            key={ing.id}
                            className="flex items-center justify-between p-2 rounded bg-gray-100"
                          >
                            <span>
                              {ing.ingre_name}: {ing.ingre_qt} {ing.ingre_unit || "g"}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeIngredient(ing.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Ajout en cours..." : "Ajouter la recette"}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>

            <Sheet open={editRecipeSheetOpen} onOpenChange={setEditRecipeSheetOpen}>
              <SheetContent className="w-full sm:w-[800px] sm:max-w-[800px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Modifier la recette</SheetTitle>
                  <SheetDescription>
                    Modifiez les informations de la recette
                  </SheetDescription>
                </SheetHeader>
                {editingRecipe && (
                  <form onSubmit={handleUpdateRecipe} className="space-y-6 mt-6 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Nom de la recette</Label>
                      <Input
                        id="edit-name"
                        value={editingRecipe.Name}
                        onChange={(e) => setEditingRecipe({ ...editingRecipe, Name: e.target.value })}
                        required
                        placeholder="Ex: Pasta Carbonara"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-categorie">Catégorie</Label>
                      <Input
                        id="edit-categorie"
                        value={editingRecipe.Categorie}
                        onChange={(e) => setEditingRecipe({ ...editingRecipe, Categorie: e.target.value })}
                        required
                        placeholder="Ex: Plat principal"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-livre">Livre</Label>
                      <Input
                        id="edit-livre"
                        value={editingRecipe.Livre}
                        onChange={(e) => setEditingRecipe({ ...editingRecipe, Livre: e.target.value })}
                        required
                        placeholder="Ex: Cuisine Italienne"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Ingrédients</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nom de l'ingrédient"
                          value={editNewIngredient.name}
                          onChange={(e) =>
                            setEditNewIngredient({ ...editNewIngredient, name: e.target.value })
                          }
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Quantité"
                          value={editNewIngredient.quantity}
                          onChange={(e) =>
                            setEditNewIngredient({ ...editNewIngredient, quantity: e.target.value })
                          }
                          className="w-24"
                        />
                        <select
                          value={editNewIngredient.unit}
                          onChange={(e) =>
                            setEditNewIngredient({ ...editNewIngredient, unit: e.target.value })
                          }
                          className="h-10 rounded-md border border-input bg-background px-2 text-sm w-20"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="mL">mL</option>
                          <option value="cL">cL</option>
                          <option value="L">L</option>
                          <option value="cuillère à soupe">c.s</option>
                          <option value="cuillère à café">c.c</option>
                          <option value="tasse">tasse</option>
                          <option value="verre">verre</option>
                          <option value="unité">unité</option>
                          <option value="pincée">pincée</option>
                        </select>
                        <Button type="button" onClick={addEditIngredient} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {editRecipeIngredients.length > 0 && (
                        <ul className="space-y-2 mt-4">
                          {editRecipeIngredients.map((ing) => (
                            <li
                              key={ing.id}
                              className="flex items-center justify-between p-2 rounded bg-gray-100"
                            >
                              <span>
                                {ing.ingre_name}: {ing.ingre_qt} {ing.ingre_unit || "g"}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEditIngredient(ing.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                    >
                      Mettre à jour la recette
                    </Button>
                  </form>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Liste des ingrédients */}
          <Card className="backdrop-blur-md bg-white/30 border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Liste des ingrédients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingIngredientsList ? (
                <p className="text-center text-gray-500">Chargement des ingrédients...</p>
              ) : ingredientsList.length === 0 ? (
                <p className="text-center text-gray-500">Aucun ingrédient disponible</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Unité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredientsList.map((ingredient) => (
                      <TableRow key={ingredient.ID}>
                        <TableCell className="font-medium">{ingredient.Name}</TableCell>
                        <TableCell className="text-right">{ingredient.Quantite}</TableCell>
                        <TableCell className="text-right">{ingredient.Unit || "g"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditIngredient(ingredient)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteIngredient(ingredient.ID)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Liste des recettes */}
          <Card className="backdrop-blur-md bg-white/30 border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Liste des recettes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecipes ? (
                <p className="text-center text-gray-500">Chargement des recettes...</p>
              ) : recipes.length === 0 ? (
                <p className="text-center text-gray-500">Aucune recette disponible</p>
              ) : (
                <div className="space-y-4">
                  {recipes.map((recipe) => {
                    let ingredients: Ingredient[] = [];
                    try {
                      ingredients = JSON.parse(recipe.Ingredients);
                    } catch (e) {
                      console.error("Erreur parsing ingredients:", e);
                    }

                    return (
                      <Card key={recipe.ID} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{recipe.Name}</CardTitle>
                              <p className="text-sm text-gray-600">
                                {recipe.Categorie} • {recipe.Livre}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditRecipe(recipe)}
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRecipe(recipe.ID)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm font-semibold mb-2">Ingrédients:</p>
                          {ingredients.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {ingredients.map((ing, idx) => (
                                <li key={idx} className="text-gray-700">
                                  • {ing.ingre_name}: {ing.ingre_qt} {ing.ingre_unit || "g"}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-sm text-gray-400">Aucun ingrédient</span>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
