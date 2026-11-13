import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Check,
  MapPin,
  Zap,
  ChevronRight,
  ChevronLeft,
  Star,
  Phone,
  Mail,
  Shield,
  ShieldCheck,
  X,
  Trash2,
  Edit3,
  Eye,
  ExternalLink,
  Users,
  Smartphone,
  MessageSquare,
  RefreshCw,
  Download,
  Play,
  Pause,
  Upload,
  Info,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Settings,
  Sliders,
  LogOut,
  FolderOpen,
  Send,
  Calendar,
  Lock,
  Medal,
  IndianRupee,
  Heart,
  Car,
  BadgeCheck,
  Video,
  Smile,
  CreditCard,
  PlayCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';

const ICON_MAP = {
  // Key icons specified in the prompt
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  north_east: ArrowUpRight,
  check_circle: CheckCircle2,
  pin_drop: MapPin,
  bolt: Zap,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  star: Star,
  call: Phone,
  mail: Mail,
  shield: Shield,
  shield_lock: ShieldCheck,

  // Fallback icon mappings for zero-font-flash
  military_tech: Medal,
  phone_iphone: Smartphone,
  currency_rupee: IndianRupee,
  favorite: Heart,
  directions_car: Car,
  verified: BadgeCheck,
  videocam: Video,
  mood: Smile,
  payments: CreditCard,
  play_circle: PlayCircle,
  volume_up: Volume2,
  volume_off: VolumeX,
  pause: Pause,
  play_arrow: Play,

  // Common UI icons
  close: X,
  delete: Trash2,
  delete_forever: Trash2,
  edit: Edit3,
  visibility: Eye,
  open_in_new: ExternalLink,
  groups: Users,
  chat: MessageSquare,
  refresh: RefreshCw,
  download: Download,
  cloud_upload: Upload,
  cloud_sync: RefreshCw,
  arrow_downward: ArrowDown,
  arrow_upward: ArrowUp,
  arrow_forward_ios: ChevronRight,
  check: Check,
  task_alt: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  error_outline: AlertCircle,
  schedule: Clock,
  celebration: Sparkles,
  search: Search,
  settings: Settings,
  tune: Sliders,
  logout: LogOut,
  inbox: FolderOpen,
  send: Send,
  event_available: Calendar,
  lock: Lock,
};

/**
 * Universal Zero-Flash Icon Component
 *
 * Renders an inline SVG icon powered by Lucide with zero reliance on web font loading.
 * Eliminates the Material Icons ligature text flash ("arrow_forward", "phone_iphone", etc.)
 * while maintaining exact sizing, color inheritance, and styling.
 */
export default function Icon({
  name,
  className = '',
  size = 20,
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
  ...props
}) {
  const IconComponent = ICON_MAP[name];

  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        strokeWidth={strokeWidth}
        className={`inline-block shrink-0 align-middle ${className}`}
        aria-hidden={ariaHidden}
        {...props}
      />
    );
  }

  // Fallback for icons not in map: render with font-display block and ligature hiding protection
  return (
    <span
      className={`material-symbols-outlined select-none overflow-hidden inline-block align-middle ${className}`}
      style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px`, lineHeight: `${size}px` }}
      aria-hidden={ariaHidden}
      {...props}
    >
      {name}
    </span>
  );
}
