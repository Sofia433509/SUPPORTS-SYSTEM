/**
 * Componente: MapLegend
 * 
 * Descripción:
 * Este componente renderiza la leyenda del mapa de oficinas, mostrando una guía visual
 * de los colores utilizados para representar diferentes elementos y estados en el mapa.
 * La leyenda ayuda al usuario a interpretar correctamente la información visual del mapa.
 * 
 * Funcionalidades:
 * - Mostrar indicadores de color para cada tipo de elemento en el mapa
 * - Incluir说明 (explicación) de cada color y su significado
 * - Diseño flexible con wrapping automático para adaptarse a diferentes tamaños de pantalla
 * - Incluye un icono de información adicional
 * 
 * Elementos de la leyenda:
 * - Verde: Escritorios sin problemas (funcionando correctamente)
 * - Rojo: Escritorios con reportes activos (requieren atención)
 * - Amarillo: Áreas de gestión/almacén
 * - Azul: Área de entrada
 * - Icono de usuario: Instrucciones para hacer clic en un escritorio
 * 
 * Props: Este componente no recibe props (es estático)
 * 
 * Dependencias:
 * - ../ui/card: Componentes Card y CardContent
 * - lucide-react: Icono User
 */

import { Card, CardContent } from '../ui/card';
import { User } from 'lucide-react';

/**
 * Componente funcional que renderiza la leyenda del mapa
 * Muestra una serie de indicadores visuales con sus significados correspondientes
 * para ayudar al usuario a entender la información presentada en el mapa
 * 
 * @returns JSX.Element - Tarjeta con la leyenda del mapa
 */
export default function MapLegend() {
  return (
    // Contenedor principal usando el componente Card
    <Card>
      {/* Contenido de la tarjeta con layout flexible y wrapping */}
      <CardContent className="flex flex-wrap gap-6 py-4">
        
        {/* Indicador 1: Escritorios sin problemas (verde) */}
        <div className="flex items-center gap-2">
          {/* Cuadrado de color verde representando el estado correcto */}
          <div className="w-4 h-4 bg-green-500 border border-gray-300 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">No issues</span>
        </div>
        
        {/* Indicador 2: Escritorios con reportes activos (rojo) */}
        <div className="flex items-center gap-2">
          {/* Cuadrado de color rojo representando alertas/problemas */}
          <div className="w-4 h-4 bg-red-500 border border-gray-300 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">With active reports</span>
        </div>
        
        {/* Indicador 3: Áreas de gestión/almacén (amarillo) */}
        <div className="flex items-center gap-2">
          {/* Cuadrado de color amarillo representando áreas administrativas */}
          <div className="w-4 h-4 bg-yellow-400 border border-gray-300 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Management / Store area</span>
        </div>
        
        {/* Indicador 4: Área de entrada (azul) */}
        <div className="flex items-center gap-2">
          {/* Cuadrado de color azul representando la entrada */}
          <div className="w-4 h-4 bg-blue-500 border border-gray-300 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Entrance area</span>
        </div>
        
        {/* Indicador 5: Instrucciones adicionales con icono */}
        <div className="flex items-center gap-2 border-l pl-4">
          {/* Icono de usuario de lucide-react */}
          <User className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-500">Click on any desk to view details</span>
        </div>
        
      </CardContent>
    </Card>
  );
}

