import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Plus, Edit2, Check, Star, StarOff, Wand2, Trash2 } from "lucide-react";

// Funzione per generare un numero casuale in un range
const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Funzione per generare un seed casuale
const getRandomSeed = () => {
  return Math.floor(Math.random() * 1000000);
};

const generateResponse = async (instruction, systemPrompt, temperature, seed) => {
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small:latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: instruction
          }
        ],
        stream: false,
        options: {
          temperature: temperature,
          seed: seed
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Errore API: ${response.status}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Errore nella chiamata API:', error);
    throw new Error('Errore nella generazione della risposta');
  }
};

const TrainingApp = () => {
  const [conversations, setConversations] = useState([]);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('Sei un assistente AI amichevole e disponibile.');
  const [variants, setVariants] = useState([
    { content: '', isEditing: false, rating: 0, parameters: {} }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVariants = async (numVariants = 3) => {
    if (!currentInstruction.trim()) return;
    
    setIsGenerating(true);
    try {
      const newResponses = await Promise.all(
        Array(numVariants).fill(null).map(async () => {
          // Genera parametri casuali per ogni variante
          const temperature = getRandomNumber(0.1, 2);
          const seed = getRandomSeed();
          
          const response = await generateResponse(
            currentInstruction,
            systemPrompt,
            temperature,
            seed
          );

          return {
            content: response,
            isEditing: false,
            rating: 0,
            parameters: {
              temperature,
              seed
            }
          };
        })
      );
      
      setVariants(newResponses);
    } catch (error) {
      console.error('Errore nella generazione:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { content: '', isEditing: false, rating: 0, parameters: {} }]);
  };

  const deleteVariant = (indexToDelete) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, index) => index !== indexToDelete));
    }
  };

  const updateVariant = (index, content) => {
    const newVariants = [...variants];
    newVariants[index].content = content;
    setVariants(newVariants);
  };

  const toggleEdit = (index) => {
    const newVariants = [...variants];
    newVariants[index].isEditing = !newVariants[index].isEditing;
    setVariants(newVariants);
  };

  const updateRating = (index, rating) => {
    const newVariants = [...variants];
    newVariants[index].rating = rating;
    setVariants(newVariants);
  };

  const handleSaveConversation = () => {
    if (currentInstruction.trim() && variants.some(v => v.content.trim())) {
      const bestVariant = variants.reduce((prev, current) => 
        (current.rating > prev.rating) ? current : prev
      );
      
      setConversations([
        ...conversations,
        {
          instruction: currentInstruction,
          systemPrompt: systemPrompt,
          variants: variants.map(v => ({
            content: v.content,
            rating: v.rating,
            parameters: v.parameters
          })),
          bestResponse: bestVariant.content,
          timestamp: new Date().toISOString()
        }
      ]);
      setCurrentInstruction('');
      setVariants([{ content: '', isEditing: false, rating: 0, parameters: {} }]);
    }
  };

  const handleExport = () => {
    const exportData = conversations.map(conv => ({
      instruction: conv.instruction,
      systemPrompt: conv.systemPrompt,
      response: conv.bestResponse
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Training Data Collector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">System Prompt:</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[100px]"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Inserisci il system prompt qui..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Istruzione/Domanda:</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[100px]"
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                placeholder="Inserisci la tua istruzione o domanda qui..."
              />
            </div>

            <div className="flex justify-between items-center">
              <Button 
                onClick={() => generateVariants(3)} 
                disabled={isGenerating || !currentInstruction.trim()}
                variant="outline"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generazione...' : 'Genera 3 Varianti'}
              </Button>
              <Button onClick={addVariant} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Aggiungi Manualmente
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <Card key={index} className={`bg-gray-50 ${variant.isEditing ? 'border-blue-400' : ''}`}>
                  <CardContent className="pt-4">
                    {variant.parameters.temperature && (
                      <div className="text-sm text-gray-500 mb-2">
                        Parametri: temperatura={variant.parameters.temperature.toFixed(2)}, seed={variant.parameters.seed}
                      </div>
                    )}
                    
                    {variant.isEditing ? (
                      <textarea
                        className="w-full p-2 border rounded-md min-h-[100px]"
                        value={variant.content}
                        onChange={(e) => updateVariant(index, e.target.value)}
                        placeholder="Inserisci o modifica la risposta..."
                        autoFocus
                      />
                    ) : (
                      <div className="whitespace-pre-wrap min-h-[50px]">
                        {variant.content || 'Clicca modifica per inserire una variante'}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleEdit(index)}
                        >
                          {variant.isEditing ? (
                            <><Check className="h-4 w-4 mr-1" /> Salva</>
                          ) : (
                            <><Edit2 className="h-4 w-4 mr-1" /> Modifica</>
                          )}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => deleteVariant(index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={variants.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => updateRating(index, rating)}
                            className="focus:outline-none"
                          >
                            {rating <= variant.rating ? (
                              <Star className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <StarOff className="h-5 w-5 text-gray-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button 
                onClick={handleSaveConversation}
                disabled={!currentInstruction.trim() || !variants.some(v => v.content.trim())}
              >
                <Save className="mr-2 h-4 w-4" />
                Salva Conversazione
              </Button>
              <Button 
                onClick={handleExport}
                disabled={conversations.length === 0}
                variant="outline"
              >
                Esporta Dataset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {conversations.map((conv, index) => (
          <Card key={index} className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="mb-4">
                <div className="font-medium mb-2">System Prompt:</div>
                <p className="mt-1 whitespace-pre-wrap text-gray-600">{conv.systemPrompt}</p>
              </div>
              <div className="mb-4">
                <div className="font-medium">Istruzione:</div>
                <p className="mt-1 whitespace-pre-wrap">{conv.instruction}</p>
              </div>
              <div>
                <span className="font-medium">Varianti:</span>
                {conv.variants.map((variant, vIndex) => (
                  <div key={vIndex} className="mt-2 p-2 border rounded-md bg-white">
                    {variant.parameters.temperature && (
                      <div className="text-sm text-gray-500 mb-1">
                        Parametri: temperatura={variant.parameters.temperature.toFixed(2)}, seed={variant.parameters.seed}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{variant.content}</p>
                    <div className="mt-1 flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Rating:</span>
                      {[...Array(variant.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrainingApp;