import {
  Landmark,
  Wallet,
  Network,
  Plus,
  CirclePlus,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Scale,
  CalendarDays,
  CircleX,
  Briefcase,
  CircleCheck,
  X,
  Contact,
  Cookie,
  Moon,
  LayoutDashboard,
  Trash2,
  FileText,
  Bus,
  Car,
  Download,
  Pencil,
  SquarePen,
  CalendarCog,
  CalendarClock,
  Heart,
  Zap,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  History,
  House,
  Hotel,
  Info,
  List,
  Building2,
  MapPin,
  LogIn,
  LogOut,
  Luggage,
  Map,
  BookOpen,
  Activity,
  ExternalLink,
  CreditCard,
  User,
  Calculator,
  Printer,
  Globe,
  ReceiptText,
  RefreshCw,
  Route,
  Clock,
  Search,
  SearchX,
  Settings,
  ShoppingCart,
  MessageSquare,
  Star,
  CircleCheckBig,
  ToggleLeft,
  ToggleRight,
  Compass,
  TrendingUp,
  SlidersHorizontal,
  Upload,
  Eye,
  CalendarX,
  ChevronDown,
  Phone,
  KeyRound,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

// Maps the former Material Symbols names (kept in markup and in data records)
// to inline Lucide SVG icons, so nothing text-based renders on a slow network.
const ICONS: Record<string, LucideIcon> = {
  account_balance: Landmark,
  account_balance_wallet: Wallet,
  account_tree: Network,
  add: Plus,
  add_circle: CirclePlus,
  admin_panel_settings: ShieldCheck,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  assignment: ClipboardList,
  auto_awesome: Sparkles,
  balance: Scale,
  calendar_month: CalendarDays,
  cancel: CircleX,
  card_travel: Briefcase,
  check_circle: CircleCheck,
  close: X,
  contact_phone: Contact,
  cookie: Cookie,
  dark_mode: Moon,
  dashboard: LayoutDashboard,
  delete: Trash2,
  description: FileText,
  directions_bus: Bus,
  directions_car: Car,
  download: Download,
  edit: Pencil,
  edit_calendar: CalendarCog,
  edit_note: SquarePen,
  event_upcoming: CalendarClock,
  favorite: Heart,
  flash_on: Zap,
  flight: Plane,
  flight_land: PlaneLanding,
  flight_takeoff: PlaneTakeoff,
  history: History,
  home: House,
  hotel: Hotel,
  info: Info,
  list_alt: List,
  local_airport: Plane,
  location_city: Building2,
  location_on: MapPin,
  login: LogIn,
  logout: LogOut,
  luggage: Luggage,
  map: Map,
  menu_book: BookOpen,
  monitoring: Activity,
  open_in_new: ExternalLink,
  payments: CreditCard,
  pending_actions: ClipboardList,
  person: User,
  point_of_sale: Calculator,
  print: Printer,
  public: Globe,
  receipt_long: ReceiptText,
  refresh: RefreshCw,
  route: Route,
  schedule: Clock,
  search: Search,
  search_off: SearchX,
  settings: Settings,
  shopping_cart: ShoppingCart,
  sms: MessageSquare,
  star: Star,
  stars: Sparkles,
  task_alt: CircleCheckBig,
  toggle_off: ToggleLeft,
  toggle_on: ToggleRight,
  travel_explore: Compass,
  trending_up: TrendingUp,
  tune: SlidersHorizontal,
  upload: Upload,
  visibility: Eye,
  event_busy: CalendarX,
  expand_more: ChevronDown,
  phone: Phone,
  pin: KeyRound,
  smartphone: Smartphone,
};

type IconProps = {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
};

/**
 * Drop-in replacement for the old Material Symbols span.
 * Renders an inline Lucide SVG sized at 1em, so existing `text-*` font-size and
 * text-color utility classes keep controlling the icon's size and color.
 */
export default function Icon({ name, className, style, strokeWidth = 2 }: IconProps) {
  const LucideGlyph = ICONS[name];
  if (!LucideGlyph) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Icon: no glyph mapped for "${name}"`);
    }
    return null;
  }
  return (
    <LucideGlyph
      className={className}
      width="1em"
      height="1em"
      strokeWidth={strokeWidth}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-hidden="true"
    />
  );
}
