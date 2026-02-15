"use client";

import { Button } from "@repo/ui/components/button";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useSession, signOut } from "next-auth/react";
import { apiClient } from "@/lib/api-client";

const HelloWorld = () => {
  const { data: session } = useSession();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<string>("");

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchIngredients = async () => {
      try {
        const { data } = await apiClient.GET("/ingredient-sets", {
          params: { query: { userId: Number(session?.user?.id) } },
        });
        if (data && data.length > 0 && data[0]) {
          setIngredients(data[0].ingredients);
        }
      } catch (error) {
        console.error("Failed to fetch ingredients:", error);
      }
    };

    fetchIngredients();
  }, [session?.user?.id]);

  const handleSubmit = async () => {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: ingredients,
      }),
    });

    const data = await response.json();
    setRecipe(data.recipe);
  };

  const handleCreate = async () => {
    const { data } = await apiClient.POST("/ingredient-sets", {
      body: {
        userId: Number(session?.user?.id),
        ingredients: ingredients,
      },
    });
    console.log("✅ 送信結果:", data);
  };

  const handleUpdate = async () => {
    const { data } = await apiClient.PATCH("/ingredient-sets/{id}", {
      params: { path: { id: String(session?.user?.id) } },
      body: {
        ingredients: ingredients,
      },
    });
    console.log("✅ 送信結果:", data);
  };

  return (
    <div>
      <input
        type="text"
        value={ingredients.join(",")}
        onChange={(e) => setIngredients(e.target.value.split(","))}
      />
      <Button size="lg" onClick={handleSubmit}>
        Hello World
      </Button>
      <Button size="lg" onClick={() => signOut()}>
        Sign Out
      </Button>
      <Button size="lg" onClick={handleCreate}>
        Create
      </Button>
      <Button size="lg" onClick={handleUpdate}>
        Update
      </Button>
      <ReactMarkdown>{recipe}</ReactMarkdown>
    </div>
  );
};

export default HelloWorld;
