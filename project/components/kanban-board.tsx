'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { House } from '@/lib/types'
import { MoreHorizontal, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface KanbanBoardProps {
  houses: House[]
  onMoveHouse: (houseId: string, newStatus: House['status']) => void
  onCreateHouse: () => void
}

const COLUMNS = [
  { id: 'a_criar', title: 'A Criar', color: 'bg-navy-100 border-navy-200' },
  { id: 'ativa', title: 'Ativa', color: 'bg-emerald-100 border-emerald-200' },
  { id: 'limitada', title: 'Limitada', color: 'bg-amber-100 border-amber-200' },
  { id: 'banida', title: 'Banida', color: 'bg-red-100 border-red-200' }
] as const

export function KanbanBoard({ houses, onMoveHouse, onCreateHouse }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, houseId: string) => {
    setDraggedItem(houseId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: House['status']) => {
    e.preventDefault()
    if (draggedItem) {
      onMoveHouse(draggedItem, status)
      setDraggedItem(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {COLUMNS.map((column) => (
        <div
          key={column.id}
          className={`${column.color} rounded-lg p-4 min-h-[600px] border-2 border-dashed transition-all duration-200 hover:shadow-md`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id as House['status'])}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-800">{column.title}</h3>
            <Badge className="bg-white/80 text-navy-700 border border-navy-300">
              {houses.filter(h => h.status === column.id).length}
            </Badge>
          </div>

          <div className="space-y-3">
            {houses
              .filter(house => house.status === column.id)
              .map((house) => (
                <Card 
                  key={house.id}
                  className="cursor-move hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm border-0 hover:scale-105"
                  draggable
                  onDragStart={(e) => handleDragStart(e, house.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-navy-800">
                        {house.nome}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-navy-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {house.grupo_clone && (
                      <Badge variant="outline" className="text-xs border-passos-300 text-passos-700">
                        {house.grupo_clone}
                      </Badge>
                    )}
                    {house.observacoes && (
                      <p className="text-xs text-navy-600 mt-2 line-clamp-2">
                        {house.observacoes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          {column.id === 'a_criar' && (
            <Button
              variant="outline"
              className="w-full mt-4 border-dashed border-navy-300 hover:bg-navy-50 hover:border-navy-400"
              onClick={onCreateHouse}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Casa
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}