import {
  Home, ClipboardList, Dumbbell, BookOpen, UserCircle, ChevronLeft,
  ArrowLeft, ChevronRight, ArrowRight, ClipboardCheck, MessageCircle,
  Phone, Award, GraduationCap, Briefcase, Mail, MapPin, Globe,
  Clock, CheckCircle, Check,
  AlertTriangle, AlertCircle, Heart, Users, Bookmark, ListOrdered,
  Tag, Brain, Frown, Zap, BarChart, ListChecks, User, X, RotateCcw,
} from 'lucide-react';
import type { NombreIcono } from '../modelos/tipos';

type ComponenteIcono = React.ComponentType<{ size?: number | string; className?: string }>;

/*
 * lucide-react 1.28 ya no incluye los íconos de marca (Instagram, YouTube,
 * LinkedIn), así que se dibujan a mano con el mismo estilo (trazo, 24x24).
 */
export function IconoInstagram({ size = 18, className }: { size?: number | string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconoYoutube({ size = 18, className }: { size?: number | string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="currentColor" />
    </svg>
  );
}
export function IconoLinkedin({ size = 18, className }: { size?: number | string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <line x1="7" y1="10" x2="7" y2="17" />
      <circle cx="7" cy="6.5" r="0.6" fill="currentColor" />
      <path d="M11 17v-4.5a2 2 0 0 1 4 0V17" />
      <line x1="11" y1="10" x2="11" y2="17" />
    </svg>
  );
}

export const MAPA_ICONOS: Record<NombreIcono, ComponenteIcono> = {
  home: Home,
  clipboardList: ClipboardList,
  dumbbell: Dumbbell,
  bookOpen: BookOpen,
  userCircle: UserCircle,
  chevronLeft: ChevronLeft,
  arrowLeft: ArrowLeft,
  chevronRight: ChevronRight,
  arrowRight: ArrowRight,
  clipboardCheck: ClipboardCheck,
  messageCircle: MessageCircle,
  phone: Phone,
  award: Award,
  graduationCap: GraduationCap,
  briefcase: Briefcase,
  mail: Mail,
  mapPin: MapPin,
  globe: Globe,
  instagram: IconoInstagram,
  youtube: IconoYoutube,
  linkedin: IconoLinkedin,
  clock: Clock,
  checkCircle: CheckCircle,
  check: Check,
  alertTriangle: AlertTriangle,
  alertCircle: AlertCircle,
  heart: Heart,
  users: Users,
  bookmark: Bookmark,
  listOrdered: ListOrdered,
  tag: Tag,
  brain: Brain,
  frown: Frown,
  zap: Zap,
  barChart: BarChart,
  listChecks: ListChecks,
  user: User,
  x: X,
  rotateCcw: RotateCcw,
};

export const OPCIONES_ICONOS = Object.keys(MAPA_ICONOS) as NombreIcono[];

export function IconoPorNombre({ nombre, size = 18, className }: { nombre: NombreIcono; size?: number; className?: string }) {
  const Icon = MAPA_ICONOS[nombre] || Home;
  return <Icon size={size} className={className} />;
}
