import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Ambulance,
  ArrowRight,
  Bird,
  BookOpen,
  CalendarDays,
  Cat,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Dog,
  Droplets,
  Edit3,
  FlaskConical,
  HeartPulse,
  History as HistoryIcon,
  Home as HomeIcon,
  MapPin,
  Navigation,
  PawPrint,
  Phone,
  Plus,
  Search,
  Scissors,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  UserRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Service = {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  icon: LucideIcon;
  tone: string;
};

type Pet = {
  id: string;
  name: string;
  type: 'Кошка' | 'Собака' | 'Птица';
  breed: string;
  age: string;
  weight: string;
};

type VaccinationRecord = {
  id: string;
  title: string;
  vaccine: string;
  date: string;
  status: 'Внесено' | 'Нужно обновить';
};

type OrderStatus = 'Поиск ветеринара' | 'Подтверждён' | 'В пути' | 'Врач прибыл' | 'Приём' | 'Завершён' | 'Отменён';

type Order = {
  id: string;
  serviceId: string;
  petId: string;
  address: string;
  time: string;
  date: string;
  status: OrderStatus;
  createdAt: string;
};

const services: Service[] = [
  { id: 'exam', name: 'Первичный осмотр', price: '1 500–2 500 ₽', duration: '60 мин', description: 'Врач осмотрит питомца, ответит на вопросы и составит план заботы.', icon: Stethoscope, tone: 'mint' },
  { id: 'vaccine', name: 'Вакцинация', price: '800–2 000 ₽', duration: '30 мин', description: 'Подберём вакцину по возрасту и состоянию здоровья питомца.', icon: Syringe, tone: 'butter' },
  { id: 'urgent', name: 'Скорая ветпомощь', price: '3 000–5 000 ₽', duration: '60 мин', description: 'Приедем, когда помощь нужна сейчас. Работаем круглосуточно.', icon: Ambulance, tone: 'coral' },
  { id: 'tests', name: 'Забор анализов', price: '600–1 500 ₽', duration: '30 мин', description: 'Аккуратно возьмём материал дома и передадим в лабораторию.', icon: FlaskConical, tone: 'lavender' },
  { id: 'parasites', name: 'Обработка от паразитов', price: '500–1 200 ₽', duration: '20 мин', description: 'Защитим питомца от внешних и внутренних паразитов.', icon: ShieldCheck, tone: 'mint' },
  { id: 'surgery', name: 'Хирургическая помощь', price: '2 000–6 000 ₽', duration: '90 мин', description: 'Малые хирургические процедуры в привычной домашней обстановке.', icon: HeartPulse, tone: 'coral' },
  { id: 'grooming', name: 'Уход и груминг', price: '700–1 500 ₽', duration: '45 мин', description: 'Бережный уход, который помогает питомцу чувствовать себя лучше.', icon: Scissors, tone: 'butter' },
  { id: 'consult', name: 'Консультация', price: '500–1 000 ₽', duration: '30 мин', description: 'Спокойно разберём симптомы, питание и поведение питомца.', icon: Phone, tone: 'lavender' },
  { id: 'dropper', name: 'Капельница на дому', price: '1 800–4 000 ₽', duration: '60 мин', description: 'Проведём инфузионную терапию под наблюдением специалиста.', icon: Droplets, tone: 'mint' },
  { id: 'boarding', name: 'Передержка', price: '900–2 500 ₽', duration: '480 мин', description: 'Позаботимся о питомце, пока вас нет рядом.', icon: HomeIcon, tone: 'butter' },
  { id: 'walk', name: 'Выгул животного', price: '600–1 200 ₽', duration: '60 мин', description: 'Надёжный выгул по привычному маршруту вашего питомца.', icon: Navigation, tone: 'lavender' },
  { id: 'castration', name: 'Кастрация', price: '3 500–8 000 ₽', duration: '90 мин', description: 'Подготовка, процедура и рекомендации по восстановлению дома.', icon: HeartPulse, tone: 'coral' },
  { id: 'sterilization', name: 'Стерилизация', price: '4 500–10 000 ₽', duration: '120 мин', description: 'Проведём операцию бережно и останемся на связи после.', icon: HeartPulse, tone: 'coral' },
];

const initialPets: Pet[] = [
  { id: 'marta', name: 'Марта', type: 'Кошка', breed: 'Британская короткошёрстная', age: '3 года', weight: '4,8 кг' },
  { id: 'bars', name: 'Барс', type: 'Собака', breed: 'Метис', age: '6 лет', weight: '18 кг' },
];

const initialOrders: Order[] = [
  { id: 'VH-2406', serviceId: 'vaccine', petId: 'marta', address: 'ул. Тверская, 18', time: 'Завтра, 11:30', date: '12 июня', status: 'Подтверждён', createdAt: '2024-06-11' },
  { id: 'VH-2384', serviceId: 'exam', petId: 'bars', address: 'ул. Тверская, 18', time: '24 мая, 18:00', date: '24 мая', status: 'Завершён', createdAt: '2024-05-24' },
];

const vaccinationRecords: Record<string, VaccinationRecord[]> = {
  marta: [
    { id: 'marta-complex', title: 'Комплексная вакцинация', vaccine: 'Nobivac Tricat Trio', date: '12 июня 2024', status: 'Внесено' },
    { id: 'marta-rabies', title: 'Бешенство', vaccine: 'Nobivac Rabies', date: '12 июня 2024', status: 'Внесено' },
  ],
  bars: [
    { id: 'bars-rabies', title: 'Бешенство', vaccine: 'Рабиген', date: '24 мая 2024', status: 'Внесено' },
  ],
};

function formatGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const items = [
    { href: '/', label: 'Главная', icon: HomeIcon },
    { href: '/services', label: 'Услуги', icon: Sparkles },
    { href: '/history', label: 'История', icon: HistoryIcon },
    { href: '/passport', label: 'Ветпаспорт', icon: BookOpen },
    { href: '/profile', label: 'Профиль', icon: UserRound },
  ];
  return (
    <div className="app-shell min-h-[100dvh]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e8e0d3]/80 bg-[#f7f3ec]/85 px-5 py-3.5 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
          <img src="/logo.jpeg" alt="Ветеринар на дом" className="h-14 w-14 rounded-full object-cover ring-2 ring-[#d6e8d6]" data-testid="img-logo" />
          <div>
            <p className="text-base font-bold leading-none tracking-[-0.03em] text-[#17493f]">Ветеринар на дом</p>
          </div>
        </Link>
        <Link href="/profile" aria-label="Открыть профиль" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f0e4] text-[#276554] transition-transform active:scale-95" data-testid="link-profile-header">
          <UserRound size={18} strokeWidth={1.8} />
        </Link>
      </header>
      <main className="safe-bottom px-4 pb-28 pt-5 sm:px-6">{children}</main>
      <nav className="safe-nav fixed bottom-0 left-1/2 z-30 w-full max-w-[760px] -translate-x-1/2 border-t border-[#dfe9dc] bg-[#fffdf8]/98 px-2 pt-2.5 shadow-[0_-10px_28px_rgba(37,83,64,.1)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center">
          {items.map(({ href, label, icon: Icon }) => {
            const active = location === href;
              return (
                <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-2 text-[11px] font-semibold outline-none transition-[transform,background-color,color,box-shadow] duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-[#79a98a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf8] ${active ? 'bg-[#dcefe0] text-[#175b46] shadow-[0_5px_16px_rgba(61,126,88,.16)]' : 'text-[#62776b] hover:bg-[#f1f6ef] hover:text-[#2d6b55]'}`} data-testid={`link-nav-${label}`}>
                <Icon className={active ? 'nav-icon-active' : ''} size={active ? 22 : 20} strokeWidth={active ? 2.4 : 1.9} />
                <span className={active ? 'nav-label-active whitespace-nowrap' : 'whitespace-nowrap'}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9a8e]">{eyebrow}</p>}
        <h2 className="font-serif text-[29px] leading-none tracking-[-0.03em] text-[#17493f]">{title}</h2>
      </div>
      {action && <button onClick={onAction} className="flex items-center gap-1 text-xs font-semibold text-[#357660]" data-testid={`button-${title}-action`}>{action}<ChevronRight size={15} /></button>}
    </div>
  );
}

function HomePage({ setPendingService, orders, pets }: { setPendingService: (id: string | null) => void; orders: Order[]; pets: Pet[] }) {
  const [, setLocation] = useLocation();
  const activeOrder = orders.find((order) => !['Завершён', 'Отменён'].includes(order.status)) || initialOrders[0];
  const activeService = services.find((item) => item.id === activeOrder.serviceId) || services[1];
  const activePet = pets.find((item) => item.id === activeOrder.petId);
  const quickServices = services.slice(0, 4);
  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <section className="relative isolate overflow-hidden rounded-[28px] bg-[#1c5648] px-5 pb-6 pt-6 text-[#f7f5ed] shadow-[0_18px_36px_rgba(23,73,63,.18)]">
        <img src="/vet-home-visit-hero.jpg" alt="Ветеринар осматривает питомца дома" className="absolute inset-0 h-full w-full object-cover object-[72%_50%] opacity-95" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,80,66,.98)_0%,rgba(24,80,66,.91)_43%,rgba(24,80,66,.42)_100%)]" />
        <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full border-[18px] border-[#72ae7d]/25" />
        <div className="absolute -bottom-20 left-16 h-44 w-44 rounded-full bg-[#6ca97a]/10" />
        <div className="relative z-10">
          <p className="text-sm font-medium text-[#bedac1]">{formatGreeting()}, Мария</p>
          <h1 className="mt-2 max-w-[290px] font-serif text-[39px] leading-[.92] tracking-[-0.035em]">Забота приходит домой.</h1>
          <p className="mt-4 max-w-[310px] text-sm leading-5 text-[#d7e9d7]">Профессиональная скорая ветеринарная помощь без очередей и стресса для питомца.</p>
          <button onClick={() => { setPendingService('urgent'); setLocation('/order'); }} className="mt-5 flex items-center gap-2 rounded-full bg-[#f3c76e] px-4 py-2.5 text-sm font-bold text-[#17493f] transition-transform active:scale-95" data-testid="button-urgent-home">
            Нужен врач сейчас <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9a8e]">Ваши визиты</p>
            <h2 className="mt-1 font-serif text-[29px] leading-none tracking-[-0.03em] text-[#17493f]">Всё под контролем</h2>
          </div>
          <Link href="/history" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ded9cb] text-[#357660] transition-colors active:bg-[#e8f2e7]" data-testid="link-history-home"><ArrowRight size={17} /></Link>
        </div>
        <div className="paper-card rounded-[22px] border border-[#ebe3d7] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e3f1e2] text-[#2e755e]"><CalendarDays size={20} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-[#255448]">{activeService.name}</p>
                <span className="rounded-full bg-[#f7e6bc] px-2.5 py-1 text-[10px] font-bold text-[#92733c]">Подтверждён</span>
              </div>
              <p className="mt-1 text-xs text-[#7b8d82]">{activePet?.name || 'Питомец'} · {activeOrder.time}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#eee8dd] pt-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#728479]"><MapPin size={14} /> ул. Тверская, 18</span>
            <Link href="/history" className="font-bold text-[#31745f]" data-testid="link-visit-details">Подробнее</Link>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <SectionHeading eyebrow="Помощь рядом" title="Что нужно питомцу?" action="Все услуги" onAction={() => setLocation('/services')} />
        <div className="grid grid-cols-2 gap-3">
          {quickServices.map((service, index) => <ServiceTile key={service.id} service={service} index={index} onSelect={() => { setPendingService(service.id); setLocation('/order'); }} />)}
        </div>
      </section>

      <section className="mt-7">
        <div className="relative overflow-hidden rounded-[24px] bg-[#e5efe4] p-5">
          <div className="relative z-10 max-w-[60%]">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#59806c]">Наша команда</p>
            <h2 className="mt-2 font-serif text-[27px] leading-[.95] tracking-[-0.03em] text-[#1e5949]">Врач, которому можно доверять</h2>
            <p className="mt-3 text-xs leading-5 text-[#5e7869]">Знакомьтесь с Анной — ветеринаром с 9-летним опытом.</p>
            <Link href="/profile" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2d705b]" data-testid="link-vet-profile">Познакомиться <ArrowRight size={14} /></Link>
          </div>
          <img src="/demo-vet-anna.jpg" alt="Ветеринар Анна" className="absolute -bottom-2 -right-3 h-44 w-40 rounded-t-[80px] object-cover object-top" data-testid="img-vet-anna" />
        </div>
      </section>
    </div>
  );
}

function ServiceTile({ service, index, onSelect }: { service: Service; index: number; onSelect: () => void }) {
  const Icon = service.icon;
  return (
    <button onClick={onSelect} className={`animate-rise animate-rise-delay-${Math.min(index + 1, 3)} group flex min-h-[132px] flex-col justify-between rounded-[22px] border border-[#e9e2d6] p-4 text-left transition-transform active:scale-[.98] ${service.tone === 'mint' ? 'bg-[#e3f1e3]' : service.tone === 'butter' ? 'bg-[#fbefd0]' : service.tone === 'coral' ? 'bg-[#f8ddd5]' : 'bg-[#e9e3f3]'}`} data-testid={`button-service-tile-${service.id}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fffaf1]/75 text-[#286551]"><Icon size={18} strokeWidth={1.8} /></span>
      <span><span className="block text-sm font-bold leading-4 text-[#26594b]">{service.name}</span><span className="mt-1 block text-[11px] font-medium text-[#70847a]">{service.duration}</span></span>
    </button>
  );
}

function ServicesPage({ setPendingService }: { setPendingService: (id: string | null) => void }) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Все');
  const [detail, setDetail] = useState<Service | null>(null);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesSearch = !query || service.name.toLowerCase().includes(query);
      const matchesFilter = filter === 'Все' || (filter === 'Срочно' ? service.id === 'urgent' : ['exam', 'vaccine', 'consult'].includes(service.id));
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);
  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <div className="mb-6 flex items-start justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9a8e]">Ветеринар на дом</p><h1 className="mt-1 font-serif text-[38px] leading-none tracking-[-0.035em] text-[#17493f]">Все услуги</h1></div>
        <div className="rounded-full bg-[#e2efe1] px-3 py-2 text-[11px] font-bold text-[#357660]">13 услуг</div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-[#e6dfd4] bg-[#fbf8f2] px-4 py-3">
        <Search size={17} className="text-[#8aa092]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти услугу" className="w-full bg-transparent text-sm text-[#27584b] outline-none placeholder:text-[#a1aaa0]" data-testid="input-service-search" />
        {search && <button onClick={() => setSearch('')} aria-label="Очистить поиск" data-testid="button-clear-search"><X size={15} className="text-[#799183]" /></button>}
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {['Все', 'Популярное', 'Срочно'].map((item) => <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${filter === item ? 'bg-[#1f5a4a] text-[#f8f5ec]' : 'bg-[#ebe9df] text-[#77877d]'}`} data-testid={`button-filter-${item}`}>{item}</button>)}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {filtered.map((service, index) => <ServiceRow key={service.id} service={service} index={index} onClick={() => setDetail(service)} />)}
        {filtered.length === 0 && <div className="rounded-[24px] border border-dashed border-[#d5d9cd] bg-[#f6f4ed] px-6 py-12 text-center md:col-span-2"><Search className="mx-auto text-[#7b9c89]" size={30} /><p className="mt-3 font-serif text-2xl text-[#27584b]">Ничего не нашли</p><p className="mt-1 text-sm text-[#86948b]">Попробуйте другое название услуги.</p></div>}
      </div>
      {detail && <ServiceDetail service={detail} onClose={() => setDetail(null)} onChoose={() => { setPendingService(detail.id); setDetail(null); setLocation('/order'); }} />}
    </div>
  );
}

function ServiceRow({ service, index, onClick }: { service: Service; index: number; onClick: () => void }) {
  const Icon = service.icon;
  return (
    <button onClick={onClick} className="animate-rise flex w-full items-center gap-3 rounded-[22px] border border-[#e9e2d6] bg-[#fffdf8]/80 p-3 text-left transition-transform active:scale-[.99]" style={{ animationDelay: `${Math.min(index, 7) * 35}ms` }} data-testid={`button-service-row-${service.id}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${service.tone === 'mint' ? 'bg-[#e3f1e3]' : service.tone === 'butter' ? 'bg-[#fbefd0]' : service.tone === 'coral' ? 'bg-[#f8ddd5]' : 'bg-[#e9e3f3]'} text-[#2c6956]`}><Icon size={20} strokeWidth={1.8} /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#28594c]">{service.name}</span><span className="mt-1 block text-xs text-[#839188]">{service.duration} · от {service.price.split('–')[0]}</span></span>
      <ChevronRight size={18} className="text-[#9bab9e]" />
    </button>
  );
}

function ServiceDetail({ service, onClose, onChoose }: { service: Service; onClose: () => void; onChoose: () => void }) {
  const Icon = service.icon;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173f35]/30 p-0 backdrop-blur-[2px]" onClick={onClose}>
    <div className="w-full max-w-[760px] rounded-t-[30px] bg-[#fbf8f2] p-5 pb-8 shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#d6dbd1]" />
      <div className="flex items-start justify-between"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3f1e3] text-[#2d705b]"><Icon size={25} /></span><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ecebe3] text-[#698078]" aria-label="Закрыть" data-testid="button-close-service-detail"><X size={18} /></button></div>
      <h2 className="mt-5 font-serif text-[34px] leading-none text-[#17493f]">{service.name}</h2>
      <p className="mt-3 text-sm leading-6 text-[#718178]">{service.description}</p>
      <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#eef3eb] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#84968a]">Стоимость</p><p className="mt-1 text-sm font-bold text-[#28594c]">{service.price}</p></div><div className="rounded-2xl bg-[#f5ecd5] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#a18a5a]">Длительность</p><p className="mt-1 text-sm font-bold text-[#735e31]">{service.duration}</p></div></div>
      <button onClick={onChoose} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f5a4a] py-3.5 text-sm font-bold text-[#f8f5ec] transition-transform active:scale-[.99]" data-testid={`button-book-service-${service.id}`}>Выбрать услугу <ArrowRight size={16} /></button>
    </div>
  </div>;
}

function OrderPage({ pets, pendingService, setPendingService, onCreateOrder }: { pets: Pet[]; pendingService: string | null; setPendingService: (id: string | null) => void; onCreateOrder: (order: Order) => void }) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(pendingService || 'exam');
  const [petId, setPetId] = useState(pets[0]?.id || '');
  const [address, setAddress] = useState('ул. Тверская, 18');
  const [time, setTime] = useState('Сегодня, 18:30');
  const [submitted, setSubmitted] = useState(false);
  const service = services.find((item) => item.id === serviceId) || services[0];
  const pet = pets.find((item) => item.id === petId) || pets[0];
  const times = ['Сегодня, 18:30', 'Сегодня, 20:00', 'Завтра, 10:00', 'Завтра, 11:30'];
  const canNext = (step === 1 && !!serviceId) || (step === 2 && !!petId) || (step === 3 && address.trim().length > 4) || (step === 4 && !!time);
  const next = () => { if (step < 4 && canNext) setStep(step + 1); };
  const submit = () => {
    const order: Order = { id: `VH-${Math.floor(2500 + Math.random() * 400)}`, serviceId, petId, address, time, date: time.split(',')[0], status: 'Поиск ветеринара', createdAt: new Date().toISOString() };
    onCreateOrder(order); setPendingService(null); setSubmitted(true);
  };
  if (submitted) return <div className="mx-auto max-w-md animate-rise pt-10 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#dcefdc] text-[#2d745c]"><CircleCheck size={42} strokeWidth={1.5} /></div><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7c9285]">Заявка отправлена</p><h1 className="mt-2 font-serif text-[40px] leading-[.9] text-[#17493f]">Мы уже ищем врача</h1><p className="mt-4 text-sm leading-6 text-[#718178]">Позвоним, как только специалист подтвердит визит. Обычно это занимает несколько минут.</p><div className="mt-7 rounded-[24px] border border-[#e9e2d6] bg-[#fffdf8] p-4 text-left"><p className="text-xs text-[#849188]">Ваша заявка</p><p className="mt-1 font-bold text-[#28594c]">{service.name}</p><p className="mt-1 text-sm text-[#718178]">{pet?.name} · {time}</p></div><button onClick={() => setLocation('/history')} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f5a4a] py-3.5 text-sm font-bold text-[#f8f5ec]" data-testid="button-open-history-success">Открыть историю <ArrowRight size={16} /></button></div>;
  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <div className="flex items-center gap-3"><button onClick={() => step > 1 ? setStep(step - 1) : setLocation('/')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e2ddd2] bg-[#fbf8f2] text-[#4d7564]" aria-label="Назад" data-testid="button-order-back"><ChevronLeft size={19} /></button><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9a8e]">Новая заявка</p><h1 className="mt-1 font-serif text-[31px] leading-none text-[#17493f]">Вызвать врача</h1></div></div>
      <div className="mt-6 flex gap-1.5">{[1, 2, 3, 4].map((item) => <div key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-[#31745f]' : 'bg-[#e2e7dc]'}`} />)}</div>
      <p className="mt-3 text-xs font-medium text-[#849188]">Шаг {step} из 4 <span className="mx-1 text-[#c2c9be]">·</span> {['Выберите услугу', 'Кто нуждается в заботе?', 'Куда приедем?', 'Когда удобно?'][step - 1]}</p>
      <div className="mt-7">
        {step === 1 && <div><SectionHeading title="Что случилось?" eyebrow="Услуга" /><div className="space-y-2.5">{services.map((item) => <button key={item.id} onClick={() => setServiceId(item.id)} className={`flex w-full items-center gap-3 rounded-[20px] border p-3 text-left transition-all ${serviceId === item.id ? 'border-[#7db496] bg-[#e7f1e5] shadow-[0_5px_18px_rgba(37,100,72,.08)]' : 'border-[#e9e2d6] bg-[#fffdf8]'}`} data-testid={`button-order-service-${item.id}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f0e7] text-[#34745e]"><item.icon size={18} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#28594c]">{item.name}</span><span className="mt-1 block text-[11px] text-[#839188]">{item.duration} · {item.price}</span></span>{serviceId === item.id && <Check size={18} className="text-[#31745f]" />}</button>)}</div></div>}
        {step === 2 && <div><SectionHeading title="Кто ваш пациент?" eyebrow="Питомец" /><div className="space-y-3">{pets.map((item) => <button key={item.id} onClick={() => setPetId(item.id)} className={`flex w-full items-center gap-3 rounded-[22px] border p-4 text-left ${petId === item.id ? 'border-[#7db496] bg-[#e7f1e5]' : 'border-[#e9e2d6] bg-[#fffdf8]'}`} data-testid={`button-order-pet-${item.id}`}><PetAvatar type={item.type} /><span className="flex-1"><span className="block font-bold text-[#28594c]">{item.name}</span><span className="mt-1 block text-xs text-[#839188]">{item.type} · {item.breed}</span><span className="mt-1 block text-xs text-[#839188]">{item.age} · {item.weight}</span></span>{petId === item.id && <Check size={18} className="text-[#31745f]" />}</button>)}</div><Link href="/profile" className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b8c9b8] py-3 text-xs font-bold text-[#34745e]" data-testid="link-add-pet-order"><Plus size={15} /> Добавить питомца в профиле</Link></div>}
        {step === 3 && <div><SectionHeading title="Адрес визита" eyebrow="Место" /><div className="rounded-[24px] border border-[#e9e2d6] bg-[#fffdf8] p-4"><div className="flex items-center gap-2 text-sm font-bold text-[#28594c]"><MapPin size={18} className="text-[#34745e]" /> Куда приедем?</div><input value={address} onChange={(event) => setAddress(event.target.value)} className="mt-4 w-full rounded-2xl border border-[#e2e4d9] bg-[#f7f6ef] px-4 py-3 text-sm text-[#28594c] outline-none focus:border-[#75a98a]" placeholder="Улица, дом, квартира" data-testid="input-order-address" /><button className="mt-3 flex items-center gap-2 text-xs font-bold text-[#34745e]" data-testid="button-use-location"><Navigation size={14} /> Определить моё местоположение</button></div><div className="mt-4 flex gap-3 rounded-2xl bg-[#e6f0e4] p-4"><ShieldCheck size={19} className="shrink-0 text-[#34745e]" /><p className="text-xs leading-5 text-[#5e7869]">Врач приедет прямо к двери. Дополнительный выезд по городу уже включён в заботу о питомце.</p></div></div>}
        {step === 4 && <div><SectionHeading title="Когда удобно?" eyebrow="Время визита" /><div className="grid grid-cols-2 gap-2.5">{times.map((item, index) => <button key={item} onClick={() => setTime(item)} className={`rounded-[20px] border p-4 text-left ${time === item ? 'border-[#7db496] bg-[#e7f1e5]' : 'border-[#e9e2d6] bg-[#fffdf8]'}`} data-testid={`button-order-time-${index}`}><Clock3 size={17} className={time === item ? 'text-[#31745f]' : 'text-[#8aa092'} /><span className="mt-3 block text-sm font-bold text-[#28594c]">{item}</span><span className="mt-1 block text-[11px] text-[#849188]">Свободный слот</span></button>)}</div><div className="mt-5 rounded-[24px] bg-[#1f5a4a] p-4 text-[#f8f5ec]"><p className="text-[10px] font-bold uppercase tracking-wider text-[#a9ccb1]">Проверьте заявку</p><div className="mt-3 flex justify-between gap-3 text-sm"><span className="text-[#cee0cf]">Услуга</span><span className="text-right font-bold">{service.name}</span></div><div className="mt-2 flex justify-between gap-3 text-sm"><span className="text-[#cee0cf]">Питомец</span><span className="font-bold">{pet?.name}</span></div><div className="mt-2 flex justify-between gap-3 text-sm"><span className="text-[#cee0cf]">Стоимость</span><span className="font-bold">{service.price}</span></div></div></div>}
      </div>
      <button onClick={step === 4 ? submit : next} disabled={!canNext} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f5a4a] py-3.5 text-sm font-bold text-[#f8f5ec] transition-all active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-40" data-testid={step === 4 ? 'button-submit-order' : 'button-order-next'}>{step === 4 ? 'Отправить заявку' : 'Продолжить'} <ArrowRight size={16} /></button>
    </div>
  );
}

function PetAvatar({ type, small = false }: { type: Pet['type']; small?: boolean }) {
  const Icon = type === 'Кошка' ? Cat : type === 'Собака' ? Dog : Bird;
  return <span className={`flex ${small ? 'h-9 w-9 rounded-xl' : 'h-12 w-12 rounded-2xl'} items-center justify-center bg-[#f5e6c8] text-[#9b7540]`}><Icon size={small ? 17 : 21} strokeWidth={1.8} /></span>;
}

function HistoryPage({ orders, pets }: { orders: Order[]; pets: Pet[] }) {
  const active = orders.find((order) => !['Завершён', 'Отменён'].includes(order.status));
  const past = orders.filter((order) => order !== active);
  return <div className="mx-auto max-w-2xl animate-rise"><div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9a8e]">Ваши обращения</p><h1 className="mt-1 font-serif text-[38px] leading-none tracking-[-0.035em] text-[#17493f]">История визитов</h1></div>
    {active && <section><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8a9a8e]">Сейчас</p><ActiveOrder order={active} pets={pets} /></section>}
    <section className={active ? 'mt-7' : ''}><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8a9a8e]">Прошлые визиты</p>{past.length ? <div className="space-y-3">{past.map((order) => <PastOrder key={order.id} order={order} pets={pets} />)}</div> : <div className="rounded-[24px] border border-dashed border-[#d5d9cd] bg-[#f6f4ed] px-6 py-12 text-center"><CalendarDays className="mx-auto text-[#7b9c89]" size={30} /><p className="mt-3 font-serif text-2xl text-[#27584b]">Здесь пока тихо</p><p className="mt-1 text-sm text-[#86948b]">Ваши завершённые визиты появятся здесь.</p></div>}</section>
  </div>;
}

function ActiveOrder({ order, pets }: { order: Order; pets: Pet[] }) {
  const service = services.find((item) => item.id === order.serviceId) || services[0];
  const pet = pets.find((item) => item.id === order.petId);
  const statuses: OrderStatus[] = ['Поиск ветеринара', 'Подтверждён', 'В пути', 'Врач прибыл', 'Приём', 'Завершён'];
  const current = statuses.indexOf(order.status);
  return <div className="rounded-[25px] bg-[#1f5a4a] p-5 text-[#f8f5ec] shadow-[0_16px_30px_rgba(23,73,63,.16)]"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9ccb1]">Заявка {order.id}</p><h2 className="mt-2 font-serif text-[30px] leading-none">{service.name}</h2></div><span className="rounded-full bg-[#f3c76e] px-2.5 py-1 text-[10px] font-bold text-[#725b29]">{order.status}</span></div><div className="mt-5 grid grid-cols-2 gap-y-3 border-t border-[#4d816d] pt-4 text-xs"><span className="flex items-center gap-2 text-[#c5ddc8]"><PawPrint size={14} /> {pet?.name || 'Питомец'}</span><span className="flex items-center gap-2 text-[#c5ddc8]"><Clock3 size={14} /> {order.time}</span><span className="col-span-2 flex items-center gap-2 text-[#c5ddc8]"><MapPin size={14} /> {order.address}</span></div><div className="mt-6 space-y-3">{statuses.map((status, index) => <div key={status} className="flex items-center gap-3"><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${index <= current ? 'border-[#a9d1af] bg-[#a9d1af] text-[#1f5a4a]' : 'border-[#618e78] text-transparent'}`}>{index <= current && <Check size={12} strokeWidth={3} />}</span><span className={`text-xs ${index === current ? 'font-bold text-[#f8f5ec]' : index < current ? 'text-[#c5ddc8]' : 'text-[#709c84]'}`}>{status}</span>{index < statuses.length - 1 && <span className={`ml-[-27px] mt-7 h-2.5 w-px ${index < current ? 'bg-[#a9d1af]' : 'bg-[#618e78]'}`} />}</div>)}</div></div>;
}

function PastOrder({ order, pets }: { order: Order; pets: Pet[] }) {
  const service = services.find((item) => item.id === order.serviceId) || services[0];
  const pet = pets.find((item) => item.id === order.petId);
  return <div className="flex items-center gap-3 rounded-[22px] border border-[#e9e2d6] bg-[#fffdf8] p-3.5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e5f0e4] text-[#36745f]"><CalendarDays size={19} /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold text-[#28594c]">{service.name}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${order.status === 'Завершён' ? 'bg-[#e3f1e3] text-[#4f8068]' : 'bg-[#f6dfdb] text-[#ae6659]'}`}>{order.status}</span></div><p className="mt-1 text-xs text-[#849188]">{pet?.name} · {order.date} · {order.time.split(',')[1] || order.time}</p></div><ChevronRight size={17} className="text-[#9bab9e]" /></div>;
}

function ProfilePage({ pets, setPets }: { pets: Pet[]; setPets: (pets: Pet[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Pet['type']>('Кошка');
  const [breed, setBreed] = useState('');
  const savePet = () => { if (!name.trim()) return; setPets([...pets, { id: `${name.toLowerCase()}-${Date.now()}`, name: name.trim(), type, breed: breed.trim() || 'Без породы', age: 'Возраст не указан', weight: 'Вес не указан' }]); setName(''); setBreed(''); setAdding(false); };
  return <div className="mx-auto max-w-2xl animate-rise"><div className="relative overflow-hidden rounded-[28px] bg-[#e3f0e2] p-5"><div className="absolute -right-7 -top-10 h-36 w-36 rounded-full border-[16px] border-[#a8cda7]/40" /><div className="relative flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1f5a4a] text-[#f8f5ec]"><span className="font-serif text-2xl">М</span></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#688a72]">Личный кабинет</p><h1 className="mt-1 font-serif text-[31px] leading-none text-[#17493f]">Мария Соколова</h1><p className="mt-2 text-xs text-[#63806d]">+7 999 123-45-67</p></div><button className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#f6f4eb]/70 text-[#39725e]" aria-label="Редактировать профиль" data-testid="button-edit-profile"><Edit3 size={16} /></button></div></div>
    <section className="mt-7"><SectionHeading eyebrow="Мои любимцы" title="Питомцы" action="Добавить" onAction={() => setAdding(true)} />{pets.length ? <div className="space-y-3">{pets.map((pet) => <div key={pet.id} className="flex items-center gap-3 rounded-[22px] border border-[#e9e2d6] bg-[#fffdf8] p-3.5" data-testid={`card-pet-${pet.id}`}><PetAvatar type={pet.type} small /><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#28594c]">{pet.name}</p><p className="mt-1 truncate text-xs text-[#849188]">{pet.type} · {pet.breed}</p><p className="mt-1 text-[11px] text-[#9aa59d]">{pet.age} · {pet.weight}</p></div><button className="flex h-8 w-8 items-center justify-center rounded-full text-[#789187]" aria-label={`Редактировать ${pet.name}`} data-testid={`button-edit-pet-${pet.id}`}><Edit3 size={15} /></button></div>)}</div> : <div className="rounded-[22px] bg-[#f1f2e9] p-5 text-center text-sm text-[#718178]">Добавьте первого питомца, чтобы оформить заявку.</div>}</section>
    <section className="mt-7"><SectionHeading eyebrow="Ваши данные" title="Контакты" /><div className="divide-y divide-[#eee8dd] rounded-[22px] border border-[#e9e2d6] bg-[#fffdf8] px-4"><InfoRow icon={Phone} label="Телефон" value="+7 999 123-45-67" /><InfoRow icon={MapPin} label="Адрес по умолчанию" value="ул. Тверская, 18" /><InfoRow icon={ShieldCheck} label="Уведомления" value="Включены" /></div></section>
    <section className="mt-7 rounded-[24px] bg-[#1f5a4a] p-5 text-[#f8f5ec]"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3d7863]"><Stethoscope size={19} /></div><div><p className="font-serif text-2xl leading-none">Анна рядом</p><p className="mt-2 text-xs leading-5 text-[#cce1cf]">Ваши данные помогают врачу подготовиться к визиту и уделить питомцу всё внимание.</p></div></div></section>
    {adding && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173f35]/30 p-0 backdrop-blur-[2px]" onClick={() => setAdding(false)}><div className="w-full max-w-[760px] rounded-t-[30px] bg-[#fbf8f2] p-5 pb-8" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-serif text-3xl text-[#17493f]">Новый питомец</h2><button onClick={() => setAdding(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ecebe3] text-[#698078]" aria-label="Закрыть" data-testid="button-close-add-pet"><X size={18} /></button></div><div className="mt-5 space-y-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Имя питомца" className="w-full rounded-2xl border border-[#e2e4d9] bg-[#f7f6ef] px-4 py-3 text-sm outline-none" data-testid="input-pet-name" /><div className="grid grid-cols-3 gap-2">{(['Кошка', 'Собака', 'Птица'] as Pet['type'][]).map((item) => <button key={item} onClick={() => setType(item)} className={`rounded-2xl border py-3 text-xs font-bold ${type === item ? 'border-[#7db496] bg-[#e7f1e5] text-[#31745f]' : 'border-[#e2e4d9] bg-[#f7f6ef] text-[#849188]'}`} data-testid={`button-pet-type-${item}`}>{item}</button>)}</div><input value={breed} onChange={(event) => setBreed(event.target.value)} placeholder="Порода (необязательно)" className="w-full rounded-2xl border border-[#e2e4d9] bg-[#f7f6ef] px-4 py-3 text-sm outline-none" data-testid="input-pet-breed" /></div><button onClick={savePet} disabled={!name.trim()} className="mt-5 w-full rounded-2xl bg-[#1f5a4a] py-3.5 text-sm font-bold text-[#f8f5ec] disabled:opacity-40" data-testid="button-save-pet">Сохранить питомца</button></div></div>}
  </div>;
}

function VetPassportPage({ pets }: { pets: Pet[] }) {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || '');
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) || pets[0];
  const records = selectedPet ? vaccinationRecords[selectedPet.id] || [] : [];

  if (!selectedPet) {
    return (
      <div className="mx-auto max-w-2xl animate-rise">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9a8e]">Документы питомца</p>
          <h1 className="mt-1 font-serif text-[38px] leading-none tracking-[-0.035em] text-[#17493f]">Ветпаспорт</h1>
        </div>
        <div className="rounded-[28px] border border-dashed border-[#cbd6c8] bg-[#f1f5ed] px-6 py-14 text-center">
          <BookOpen className="mx-auto text-[#4d876d]" size={34} strokeWidth={1.6} />
          <p className="mt-4 font-serif text-2xl text-[#27584b]">Добавьте питомца</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[#7c8e83]">Здесь будут храниться прививки и важные записи о здоровье.</p>
          <Link href="/profile" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1f5a4a] px-5 py-3 text-sm font-bold text-[#f8f5ec]">Открыть профиль <ArrowRight size={16} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9a8e]">Документы питомца</p>
          <h1 className="mt-1 font-serif text-[38px] leading-none tracking-[-0.035em] text-[#17493f]">Ветпаспорт</h1>
        </div>
        <span className="rounded-full bg-[#e2efe1] px-3 py-2 text-[10px] font-bold text-[#357660]">Электронный</span>
      </div>

      <section className="relative overflow-hidden rounded-[28px] bg-[#1f5a4a] p-5 text-[#f8f5ec] shadow-[0_18px_34px_rgba(23,73,63,.16)]">
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full border-[18px] border-[#83ba8b]/20" />
        <div className="absolute -bottom-16 left-16 h-36 w-36 rounded-full bg-[#83ba8b]/10" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <PetAvatar type={selectedPet.type} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9ccb1]">Пациент</p>
                <h2 className="mt-1 font-serif text-3xl leading-none">{selectedPet.name}</h2>
                <p className="mt-2 text-xs text-[#c5ddc8]">{selectedPet.type} · {selectedPet.breed}</p>
              </div>
            </div>
            <ShieldCheck className="text-[#b8dcb6]" size={25} strokeWidth={1.5} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#4d816d] pt-4">
            <div><p className="text-[10px] uppercase tracking-[0.12em] text-[#a9ccb1]">Возраст</p><p className="mt-1 text-sm font-semibold">{selectedPet.age}</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.12em] text-[#a9ccb1]">Вес</p><p className="mt-1 text-sm font-semibold">{selectedPet.weight}</p></div>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <SectionHeading eyebrow="Ваши любимцы" title="Выберите питомца" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pets.map((pet) => (
            <button key={pet.id} onClick={() => setSelectedPetId(pet.id)} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#79a98a] ${selectedPet.id === pet.id ? 'border-[#78aa8b] bg-[#e2efe1] text-[#2d6c56]' : 'border-[#e7e1d6] bg-[#fffdf8] text-[#829087]'}`} data-testid={`button-passport-pet-${pet.id}`}>
              <PetAvatar type={pet.type} small />
              {pet.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9a8e]">Профилактика</p>
            <h2 className="font-serif text-[29px] leading-none tracking-[-0.03em] text-[#17493f]">Прививки</h2>
          </div>
          <span className="text-xs font-semibold text-[#6f8679]">{records.length} {records.length === 1 ? 'запись' : 'записи'}</span>
        </div>
        {records.length ? (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="flex items-center gap-3 rounded-[22px] border border-[#e9e2d6] bg-[#fffdf8] p-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e5f0e4] text-[#36745f]"><Syringe size={19} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#28594c]">{record.title}</p>
                  <p className="mt-1 text-xs text-[#849188]">{record.vaccine} · {record.date}</p>
                </div>
                <span className="rounded-full bg-[#e3f1e3] px-2 py-1 text-[10px] font-bold text-[#4f8068]">{record.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#d5d9cd] bg-[#f6f4ed] px-5 py-8 text-center">
            <p className="font-serif text-2xl text-[#27584b]">Записей пока нет</p>
            <p className="mt-1 text-sm text-[#86948b]">После визита врача они появятся здесь.</p>
          </div>
        )}
      </section>

      <Link href="/order" className="mt-7 flex items-center justify-between rounded-[24px] bg-[#f3c76e] px-5 py-4 text-sm font-bold text-[#17493f] transition-transform active:scale-[.99]" data-testid="link-passport-book-visit">
        <span>Обновить данные после визита</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex items-center gap-3 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f1e6] text-[#3b765f]"><Icon size={16} /></span><span className="flex-1"><span className="block text-[11px] text-[#95a198]">{label}</span><span className="mt-0.5 block text-sm font-semibold text-[#28594c]">{value}</span></span><ChevronRight size={16} className="text-[#b3bdb4]" /></div>;
}

function Router() {
  const [pendingService, setPendingService] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>(() => { try { return JSON.parse(localStorage.getItem('vethome-pets') || 'null') || initialPets; } catch { return initialPets; } });
  const [orders, setOrders] = useState<Order[]>(() => { try { return JSON.parse(localStorage.getItem('vethome-orders') || 'null') || initialOrders; } catch { return initialOrders; } });
  useEffect(() => { localStorage.setItem('vethome-pets', JSON.stringify(pets)); }, [pets]);
  useEffect(() => { localStorage.setItem('vethome-orders', JSON.stringify(orders)); }, [orders]);
  const createOrder = (order: Order) => setOrders((current) => [order, ...current]);
  return <AppShell><RoutedErrorBoundary><Switch><Route path="/" component={() => <HomePage setPendingService={setPendingService} orders={orders} pets={pets} />} /><Route path="/services" component={() => <ServicesPage setPendingService={setPendingService} />} /><Route path="/order" component={() => <OrderPage pets={pets} pendingService={pendingService} setPendingService={setPendingService} onCreateOrder={createOrder} />} /><Route path="/history" component={() => <HistoryPage orders={orders} pets={pets} />} /><Route path="/passport" component={() => <VetPassportPage pets={pets} />} /><Route path="/profile" component={() => <ProfilePage pets={pets} setPets={setPets} />} /><Route component={NotFound} /></Switch></RoutedErrorBoundary></AppShell>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;