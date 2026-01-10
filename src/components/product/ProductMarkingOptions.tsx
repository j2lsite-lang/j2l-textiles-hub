import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const MARKING_TYPES = [
  'Sérigraphie',
  'Broderie',
  'Transfert',
  'DTF',
  'DTG/DIG',
  'Sublimation',
  'Flex',
  'Flocage',
  'Gravure',
  'Sans marquage',
] as const;

export const MARKING_LOCATIONS = [
  'Cœur',
  'Poitrine',
  'Dos',
  'Manche',
  'Nuque',
  'Autre',
] as const;

interface ProductMarkingOptionsProps {
  markingType: string;
  markingLocation: string;
  markingNotes: string;
  onMarkingTypeChange: (value: string) => void;
  onMarkingLocationChange: (value: string) => void;
  onMarkingNotesChange: (value: string) => void;
}

export function ProductMarkingOptions({
  markingType,
  markingLocation,
  markingNotes,
  onMarkingTypeChange,
  onMarkingLocationChange,
  onMarkingNotesChange,
}: ProductMarkingOptionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Personnalisation</h3>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marking-type">Type de marquage *</Label>
          <Select value={markingType} onValueChange={onMarkingTypeChange}>
            <SelectTrigger id="marking-type">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {MARKING_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marking-location">Emplacement *</Label>
          <Select value={markingLocation} onValueChange={onMarkingLocationChange}>
            <SelectTrigger id="marking-location">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {MARKING_LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="marking-notes">Précisions (optionnel)</Label>
        <Textarea
          id="marking-notes"
          rows={2}
          placeholder="Couleurs du logo, nombre de couleurs, dimensions souhaitées..."
          value={markingNotes}
          onChange={(e) => onMarkingNotesChange(e.target.value)}
        />
      </div>
    </div>
  );
}
