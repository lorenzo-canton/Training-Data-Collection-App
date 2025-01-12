import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Plus, Edit2, Check, Star, StarOff, Wand2, Trash2 } from "lucide-react";

// Implementazione della chiamata API a Ollama
const generateResponse = async (instruction, model = 'llama3.2', temperature = 0.7, seed = null) => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: instruction,
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
    return data.response;
  } catch (error) {
    console.error('Errore nella chiamata API:', error);
    throw new Error('Errore nella generazione della risposta');
  }
};

const TrainingApp = () => {
  const [conversations, setConversations] = useState([]);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [variants, setVariants] = useState([
    { content: '', isEditing: false, rating: 0, model: '' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [seed, setSeed] = useState('');

  // Modelli Ollama disponibili
  const availableModels = [
    { id: 'mistral-small:latest', name: 'Mistral small' }
  ];

  const addVariant = () => {
    setVariants([...variants, { content: '', isEditing: false, rating: 0, model: '' }]);
  };

  const deleteVariant = (indexToDelete) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, index) => index !== indexToDelete));
    }
  };

  const generateVariants = async () => {
    if (!currentInstruction.trim()) return;
    
    setIsGenerating(true);
    try {
      // Genera una risposta per ogni modello disponibile
      const newResponses = await Promise.all(
        availableModels.map(async model => {
          const response = await generateResponse(
            currentInstruction, 
            model.id,
            temperature,
            seed ? parseInt(seed) : null
          );
          return {
            content: response,
            isEditing: false,
            rating: 0,
            model: model.name
          };
        })
      );
      
      setVariants([...variants, ...newResponses]);
    } catch (error) {
      console.error('Errore nella generazione:', error);
      // Qui puoi aggiungere una gestione degli errori più sofisticata
    } finally {
      setIsGenerating(false);
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
          variants: variants.map(v => ({
            content: v.content,
            rating: v.rating,
            model: v.model
          })),
          bestResponse: bestVariant.content,
          timestamp: new Date().toISOString()
        }
      ]);
      setCurrentInstruction('');
      setVariants([{ content: '', isEditing: false, rating: 0, model: '' }]);
    }
  };

  const handleExport = () => {
    const exportData = conversations.map(conv => ({
      instruction: conv.instruction,
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
          <CardTitle>Training Data Collector con Generazione Automatica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Istruzione/Domanda:</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[100px]"
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                placeholder="Inserisci la tua istruzione o domanda qui..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Temperatura (0-2):</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={temperature}
                  onChange={(e) => setTemperature(Math.max(0, Math.min(2, parseFloat(e.target.value))))}
                  min="0"
                  max="2"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Seed (opzionale):</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Lascia vuoto per random"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button 
                onClick={generateVariants} 
                disabled={isGenerating || !currentInstruction.trim()}
                variant="outline"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generazione...' : 'Genera Varianti'}
              </Button>
              <Button onClick={addVariant} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Aggiungi Manualmente
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <Card key={index} className={`bg-gray-50 ${variant.isEditing ? 'border-blue-400' : ''}`}>
                  <CardContent className="pt-4">
                    {variant.model && (
                      <div className="text-sm text-gray-500 mb-2">
                        Generato da: {variant.model}
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
                <span className="font-medium">Istruzione:</span>
                <p className="mt-1 whitespace-pre-wrap">{conv.instruction}</p>
              </div>
              <div>
                <span className="font-medium">Varianti:</span>
                {conv.variants.map((variant, vIndex) => (
                  <div key={vIndex} className="mt-2 p-2 border rounded-md bg-white">
                    {variant.model && (
                      <div className="text-sm text-gray-500 mb-1">
                        Modello: {variant.model}
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