"use client";

import { Button } from "@repo/ui/components/button";
import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useSession, signOut } from "next-auth/react";
import { createAuthClient } from "@/lib/auth-api-client";

const HelloWorld = () => {
  const { data: session } = useSession();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<string>("");

  const authClient = useMemo(
    () => session?.accessToken ? createAuthClient(session.accessToken) : null,
    [session?.accessToken]
  );

  useEffect(() => {
    if (!authClient) return;
    const fetchIngredients = async () => {
      try {
        const { data } = await authClient.GET("/ingredient-sets");
        if (data && data.length > 0 && data[0]) {
          setIngredients(data[0].ingredients);
        }
      } catch (error) {
        console.error("Failed to fetch ingredients:", error);
      }
    };

    fetchIngredients();
  }, [authClient]);

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
    if (!authClient) return;
    const { data } = await authClient.POST("/ingredient-sets", {
      body: {
        ingredients: ingredients,
      },
    });
    console.log("✅ 送信結果:", data);
  };

  const handleUpdate = async () => {
    if (!authClient) return;
    const { data } = await authClient.PATCH("/ingredient-sets", {
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
