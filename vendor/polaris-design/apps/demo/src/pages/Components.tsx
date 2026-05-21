import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  FileIcon,
  FileCard,
  NovaInput,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  SimpleTooltip,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  Navbar,
  NavbarBrand,
  NavbarNav,
  NavbarItem,
  NavbarActions,
  PromptChip,
  Checkbox,
  Switch,
  Skeleton,
  Alert,
  AlertTitle,
  AlertDescription,
  Pagination,
  PaginationItem,
  PaginationPrev,
  PaginationNext,
  PaginationEllipsis,
  PaginationFooter,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  EmptyState,
  Stack,
  Container,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
  DatePicker,
  DateRangePicker,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  // Tier 3.5 — feedback / utility (v0.7.4)
  Progress,
  CopyButton,
  Stat,
  Disclosure,
  DisclosureRoot,
  DisclosureTrigger,
  DisclosureContent,
  // Tier 3.6 — file / time inputs (v0.7.5)
  FileInput,
  FileDropZone,
  DateTimeInput,
  TimeInput,
  // Tier 3.7 — Table helpers (v0.7.5)
  TableSearchInput,
  TableToolbar,
  TableSelectionBar,
  TableSkeleton,
  type TableSortDirection,
  // v0.7.6 — additions
  AvatarGroup,
  // v0.7.7 — new components
  CircularProgress,
  PageHeader,
  SectionHeader,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Combobox,
  type ComboboxOption,
} from '@polaris/ui';
import { BellIcon, ChevronRightIcon, DeleteIcon, DownloadIcon, FolderIcon, ImageIcon, PencilLineIcon, PlusIcon, SearchIcon, SettingsIcon } from '@polaris/ui/icons';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@polaris/ui/form';
import {
  Ribbon,
  RibbonTabs,
  RibbonTabList,
  RibbonTab,
  RibbonContent,
  RibbonGroup,
  RibbonSeparator,
  RibbonButton,
  RibbonSplitButton,
  RibbonToggleGroup,
  RibbonToggleItem,
} from '@polaris/ui/ribbon';
import type { DateRange } from 'react-day-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, MoreHorizontal, Copy, FileText, Home, Star, HelpCircle, TrendingUp, Clipboard, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link as LinkIcon, Code, Quote, Heading1, Heading2, Highlighter, Type } from 'lucide-react';

type ToastEntry = { id: number; title: string; description?: string; variant: 'info' | 'success' | 'warning' | 'danger' };

export default function Components() {
  const [tab, setTab] = useState('overview');
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [novaQuery, setNovaQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [page, setPage] = useState(3);
  const [pickedDate, setPickedDate] = useState<Date | undefined>();
  const [pickedRange, setPickedRange] = useState<DateRange | undefined>();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [ribbonAlign, setRibbonAlign] = useState('justify');
  const [mdMarks, setMdMarks] = useState<string[]>(['bold']);
  // Category tab state — 6 buckets that group the 45 section showcases.
  // Default 'foundation' so the page lands on the simplest pieces.
  const [catTab, setCatTab] = useState<'foundation' | 'forms' | 'navigation' | 'overlays' | 'data' | 'polaris'>('foundation');
  // v0.7.4 / v0.7.5 demo state
  const [progressVal, setProgressVal] = useState(47);
  const [paginationFooterPage, setPaginationFooterPage] = useState(3);
  const [paginationFooterSize, setPaginationFooterSize] = useState(25);
  const [tableSort, setTableSort] = useState<{ key: 'name' | 'created'; dir: TableSortDirection }>({ key: 'name', dir: 'asc' });
  const [tableQuery, setTableQuery] = useState('');
  const [tableFilter, setTableFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [tableSelected, setTableSelected] = useState<number[]>([]);
  const [datetimeVal, setDatetimeVal] = useState('2026-12-31T23:59');
  const [timeVal, setTimeVal] = useState('09:30');
  // v0.7.6 / v0.7.7 demo state
  const [textareaVal, setTextareaVal] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tabVariant, setTabVariant] = useState<'pill' | 'underline'>('pill');
  const [comboCity, setComboCity] = useState<string | null>('seoul');
  const [comboTags, setComboTags] = useState<string[]>(['urgent']);
  const contactForm = useForm<{ name: string; email: string }>({
    resolver: zodResolver(z.object({
      name: z.string().min(2, '2자 이상 입력하세요'),
      email: z.string().email('이메일 형식이 올바르지 않습니다'),
    })),
    defaultValues: { name: '', email: '' },
  });

  const pushToast = (variant: ToastEntry['variant'], title: string, description?: string) => {
    setToasts((t) => [...t, { id: Date.now() + Math.random(), title, description, variant }]);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-polaris-md pb-polaris-md border-b border-line-neutral">
        <h1 className="text-polaris-heading2 mb-1">Polaris Components</h1>
        <p className="text-polaris-body2 text-label-alternative">
          60+개 컴포넌트의 variant·상태·조합 검증. 카테고리 탭으로 분리되어 있으니 관심 영역만 골라 볼 수 있습니다.
        </p>
      </header>

      {/*
        Category tabs — sticky underline below the page header. The tabs
        steer which `<Section cat="...">` blocks render; sections with a
        non-matching `cat` return null. Keeps the source layout flat
        (sections stay in their original order) while giving the catalog
        a navigable IA.
      */}
      <Tabs value={catTab} onValueChange={(v) => setCatTab(v as typeof catTab)}>
        <TabsList variant="underline" className="mb-polaris-lg sticky top-0 z-10 bg-background-base">
          <TabsTrigger value="foundation">Foundation</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="polaris">Polaris</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ============================================================ */}
      {/* FOUNDATION                                                   */}
      {/* ============================================================ */}

      <Section cat="foundation" current={catTab} title="1. Button — variants × sizes × 슬롯 / 상태">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Variants</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button>Primary</Button>
              <Button variant="secondary">
                <Sparkles className="h-4 w-4" /> Secondary (NOVA)
              </Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Sizes</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="md">
                <PlusIcon className="h-4 w-4" /> 새 문서
              </Button>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">States — loading / disabled</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Slots — iconLeft / iconRight / fullWidth</p>
            <Stack gap={2}>
              <Stack direction="row" gap={2} wrap>
                <Button iconLeft={<PlusIcon />}>새 항목</Button>
                <Button variant="tertiary" iconRight={<ChevronRightIcon />}>다음</Button>
                <Button variant="ai" iconLeft={<Sparkles />} iconRight={<ChevronRightIcon />}>AI 작성</Button>
              </Stack>
              <Button fullWidth iconLeft={<DownloadIcon />}>전체 내보내기 (fullWidth)</Button>
            </Stack>
          </div>
        </Stack>
      </Section>

      <Section cat="foundation" current={catTab} title="2. Card — header / body / footer + interactive">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">기본 — header / body / footer</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>분기 보고서</CardTitle>
                  <CardDescription>2026년 1분기 매출 및 비용 분석 자료</CardDescription>
                </CardHeader>
                <CardBody>
                  <p className="text-polaris-body2 text-label-neutral">
                    NOVA가 자동 생성한 요약: 전 분기 대비 매출 12% 증가, 영업이익 8% 증가.
                  </p>
                </CardBody>
                <CardFooter>
                  <Button variant="tertiary" size="sm">취소</Button>
                  <Button size="sm">열기</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>NOVA 추천 작업</CardTitle>
                  <CardDescription>최근 활동 기반</CardDescription>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-1.5 text-polaris-body2 text-label-neutral">
                    <li>• 회의록을 한 장 분량으로 요약</li>
                    <li>• 보고서 표지 이미지 생성</li>
                    <li>• 영문 번역 초안 작성</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">interactive — hover + focus ring</p>
            <div className="grid grid-cols-3 gap-polaris-md">
              <Card variant="padded" interactive asChild>
                <a href="#" className="block text-left no-underline">
                  <CardTitle className="mb-1">클릭 가능</CardTitle>
                  <CardDescription>호버 시 shadow + border 강조</CardDescription>
                </a>
              </Card>
              <Card variant="padded" interactive>
                <CardTitle className="mb-1">div 그대로</CardTitle>
                <CardDescription>asChild 없이 시각만</CardDescription>
              </Card>
              <Card variant="padded">
                <CardTitle className="mb-1">기본</CardTitle>
                <CardDescription>interactive 미지정 — 정적</CardDescription>
              </Card>
            </div>
          </div>
        </Stack>
      </Section>

      <Section cat="foundation" current={catTab} title="3. Badge — variants × tones × icon / dismissible">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">파일 유형 + AI 변형</p>
            <div className="flex flex-wrap gap-2">
              <Badge>neutral</Badge>
              <Badge variant="primary">primary</Badge>
              <Badge variant="secondary"><Sparkles className="h-3 w-3" /> AI</Badge>
              <Badge variant="success">success</Badge>
              <Badge variant="warning">warning</Badge>
              <Badge variant="danger">danger</Badge>
              <Badge variant="info">info</Badge>
              <Badge variant="docx">DOCX</Badge>
              <Badge variant="xlsx">XLSX</Badge>
              <Badge variant="pptx">PPTX</Badge>
              <Badge variant="pdf">PDF</Badge>
              <Badge variant="hwp">HWP</Badge>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">subtle (default)</p>
            <Stack direction="row" gap={2} wrap>
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </Stack>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">solid</p>
            <Stack direction="row" gap={2} wrap>
              <Badge variant="neutral" tone="solid">Neutral</Badge>
              <Badge variant="primary" tone="solid">Primary</Badge>
              <Badge variant="success" tone="solid">Success</Badge>
              <Badge variant="warning" tone="solid">Warning</Badge>
              <Badge variant="danger" tone="solid">Danger</Badge>
              <Badge variant="info" tone="solid">Info</Badge>
            </Stack>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">outline — passive 상태 (초안 / 비활성 / 위반)</p>
            <Stack direction="row" gap={2} wrap>
              <Badge variant="neutral" tone="outline">초안</Badge>
              <Badge variant="primary" tone="outline">검토 중</Badge>
              <Badge variant="success" tone="outline">완료</Badge>
              <Badge variant="warning" tone="outline">대기</Badge>
              <Badge variant="danger" tone="outline">정책 위반</Badge>
              <Badge variant="info" tone="outline">알림</Badge>
            </Stack>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">icon + dismissible (filter chip)</p>
            <Stack direction="row" gap={2} wrap>
              <Badge variant="success" icon={<span>✓</span>}>완료</Badge>
              <Badge variant="info" icon={<span>i</span>}>알림</Badge>
              <Badge variant="primary" tone="solid" dismissible onDismiss={() => pushToast('info', 'docx 필터 제거')}>docx</Badge>
              <Badge variant="primary" tone="solid" dismissible onDismiss={() => pushToast('info', 'pdf 필터 제거')}>pdf</Badge>
              <Badge variant="primary" tone="solid" dismissible onDismiss={() => pushToast('info', 'xlsx 필터 제거')}>xlsx</Badge>
            </Stack>
          </div>
        </Stack>
      </Section>

      <Section cat="foundation" current={catTab} title="4. Avatar & AvatarGroup — sizes + overlap">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Sizes</p>
            <div className="flex items-end gap-4">
              <Avatar size="sm"><AvatarFallback>김</AvatarFallback></Avatar>
              <Avatar size="md"><AvatarFallback>이</AvatarFallback></Avatar>
              <Avatar size="lg"><AvatarFallback>박</AvatarFallback></Avatar>
              <Avatar size="xl"><AvatarFallback>최</AvatarFallback></Avatar>
              <Avatar size="md">
                <AvatarImage src="https://i.pravatar.cc/100" alt="example" />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">AvatarGroup — overlap + +N 인디케이터</p>
            <Stack direction="row" gap={6} align="center">
              <AvatarGroup size="md" max={4}>
                <Avatar><AvatarFallback>김</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>이</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>박</AvatarFallback></Avatar>
              </AvatarGroup>
              <AvatarGroup size="md" max={3}>
                <Avatar><AvatarFallback>김</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>이</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>박</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>최</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>윤</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>한</AvatarFallback></Avatar>
              </AvatarGroup>
              <AvatarGroup size="lg" max={2}>
                <Avatar><AvatarFallback>1</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>2</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>3</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>4</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>5</AvatarFallback></Avatar>
              </AvatarGroup>
            </Stack>
          </div>
        </Stack>
      </Section>

      <Section cat="foundation" current={catTab} title="5. FileIcon — 파일 유형 아이콘 (폴라리스 고유)">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col items-center gap-1">
            <FileIcon type="docx" size={28} />
            <span className="text-polaris-caption1 text-label-alternative">28</span>
          </div>
          {(['docx', 'xlsx', 'pptx', 'pdf', 'hwp'] as const).map((t) => (
            <div key={t} className="flex flex-col items-center gap-1">
              <FileIcon type={t} size={40} />
              <span className="text-polaris-caption1 text-label-alternative">{t}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1">
            <FileIcon type="docx" size={64} />
            <span className="text-polaris-caption1 text-label-alternative">64</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FileIcon type="folder" size={40} />
            <span className="text-polaris-caption1 text-label-alternative">folder</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FileIcon type="image" size={40} />
            <span className="text-polaris-caption1 text-label-alternative">image</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FileIcon type="zip" size={40} />
            <span className="text-polaris-caption1 text-label-alternative">zip</span>
          </div>
        </div>
      </Section>

      <Section cat="foundation" current={catTab} title="6. FileCard — 파일 카드 (폴라리스 고유)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FileCard type="docx" name="원티드 하이파이브 스크립트.docx" meta="2026/04/22 오전 11:06" onClick={() => pushToast('info', '문서를 열었습니다', '원티드 하이파이브 스크립트.docx')} />
          <FileCard type="xlsx" name="2026 핸디소프트 임원 평가.xlsx" meta="2026/02/03 오후 2:14" />
          <FileCard type="pptx" name="26년 03월 월간경영회의_final.pptx" meta="2026/03/03 오전 11:10" />
          <FileCard type="pdf" name="자료.pdf" meta="2025/12/09 오전 10:18" />
          <FileCard type="hwp" name="제안서_v1.0.hwp" meta="2026/02/14 오전 9:00" trailing={<Badge variant="warning">검토 중</Badge>} />
        </div>
      </Section>

      <Section cat="foundation" current={catTab} title="7. Stack & Container — 레이아웃 프리미티브">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Stack / HStack / VStack</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="padded">
                <p className="text-polaris-caption1 text-label-alternative mb-3">VStack gap=2</p>
                <Stack gap={2}>
                  <div className="bg-accent-brand-normal-subtle text-accent-brand-normal px-3 py-1.5 rounded-polaris-md text-polaris-body2">A</div>
                  <div className="bg-accent-brand-normal-subtle text-accent-brand-normal px-3 py-1.5 rounded-polaris-md text-polaris-body2">B</div>
                  <div className="bg-accent-brand-normal-subtle text-accent-brand-normal px-3 py-1.5 rounded-polaris-md text-polaris-body2">C</div>
                </Stack>
              </Card>
              <Card variant="padded">
                <p className="text-polaris-caption1 text-label-alternative mb-3">HStack gap=3 align=center</p>
                <Stack direction="row" gap={3} align="center">
                  <Avatar size="sm"><AvatarFallback>P</AvatarFallback></Avatar>
                  <span className="text-polaris-body2">홍길동</span>
                  <Badge variant="success">활성</Badge>
                  <Stack direction="row" gap={1} align="center" className="ml-auto">
                    <Button variant="ghost" size="sm">편집</Button>
                    <Button variant="ghost" size="sm">삭제</Button>
                  </Stack>
                </Stack>
              </Card>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Container — 반응형 max-width + padding</p>
            <div className="bg-fill-neutral rounded-polaris-md py-4">
              <Container size="md" className="bg-accent-brand-normal-subtle py-4 rounded-polaris-md text-center">
                <p className="text-polaris-body2">size="md" — max-w-screen-md, mx-auto, px 반응형</p>
              </Container>
            </div>
          </div>
        </Stack>
      </Section>

      <Section cat="foundation" current={catTab} title="8. Skeleton — placeholder + shape preset">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">기본 — 사용자 카드 placeholder</p>
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-polaris-pill" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-32 w-full" />
              </CardBody>
            </Card>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">shape preset — circle / text(lines) / rect</p>
            <Stack direction="row" gap={4} align="start">
              <Skeleton shape="circle" className="h-12 w-12" />
              <div className="flex-1 max-w-md">
                <Skeleton shape="text" lines={3} />
              </div>
              <Skeleton shape="rect" className="h-12 w-32" />
            </Stack>
          </div>
        </Stack>
      </Section>

      <Section cat="foundation" current={catTab} title="9. Disclosure — 단일 collapsible (Radix 기반)">
        <Card variant="padded">
          <Stack gap={2}>
            <Disclosure title="기본 — 셰브론 자동 회전">
              <p className="text-polaris-body2 text-label-neutral">
                Radix Collapsible로 ARIA aria-expanded / aria-controls 자동.
              </p>
            </Disclosure>
            <Disclosure title="기본 열림 (defaultOpen)" defaultOpen>
              <Stack gap={2}>
                <Input label="별명" placeholder="입력하세요" />
                <Input label="이메일" type="email" placeholder="user@example.com" />
              </Stack>
            </Disclosure>
            <Disclosure title="셰브론 숨김 (hideChevron)" hideChevron>
              <p className="text-polaris-body2 text-label-neutral">트리거에서 chevron 제거.</p>
            </Disclosure>

            <p className="text-polaris-caption1 text-label-alternative mt-2">
              Compound API — 커스텀 trigger (asChild)
            </p>
            <DisclosureRoot>
              <DisclosureTrigger asChild>
                <Button variant="tertiary" size="sm">
                  Button을 트리거로
                </Button>
              </DisclosureTrigger>
              <DisclosureContent>
                <p className="text-polaris-body2 text-label-neutral mt-2">
                  asChild=true면 wrapper/chevron 모두 생략 — 자식 element가 trigger를 fully own.
                </p>
              </DisclosureContent>
            </DisclosureRoot>
          </Stack>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/* FORMS                                                        */}
      {/* ============================================================ */}

      <Section cat="forms" current={catTab} title="1. Input — label / hint / error + prefix / suffix / clearable">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">기본 — label / hint / error</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <Input label="문서 제목" placeholder="제목을 입력하세요" helperText="3자 이상" />
              <Input label="이메일" placeholder="you@polaris.com" type="email" error="유효하지 않은 형식입니다" />
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">prefix / suffix / clearable</p>
            <Stack direction="row" gap={3} wrap>
              <Input label="금액" prefix="₩" suffix="KRW" clearable defaultValue="120,000" containerClassName="w-72" />
              <Input label="검색" prefix={<SearchIcon />} clearable
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                containerClassName="w-72" />
            </Stack>
          </div>
        </Stack>
      </Section>

      <Section cat="forms" current={catTab} title="2. Textarea — autoResize + showCount">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">기본</p>
            <Textarea label="설명" placeholder="설명을 입력하세요" containerClassName="max-w-2xl" />
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">autoResize + maxLength + showCount</p>
            <Textarea
              label="피드백"
              placeholder="자유롭게 작성하세요"
              autoResize={{ minRows: 2, maxRows: 8 }}
              maxLength={300}
              showCount
              value={textareaVal}
              onChange={(e) => setTextareaVal(e.target.value)}
            />
          </div>
        </Stack>
      </Section>

      <Section cat="forms" current={catTab} title="3. NovaInput — AI 프롬프트 입력 (폴라리스 고유)">
        <div className="max-w-2xl">
          <NovaInput
            value={novaQuery}
            onChange={(e) => setNovaQuery(e.target.value)}
            onSubmit={(v) => {
              setSubmitted(v);
              setNovaQuery('');
              pushToast('info', 'NOVA에게 요청을 보냈습니다', v.slice(0, 60));
            }}
          />
          {submitted && (
            <p className="text-polaris-caption1 text-label-alternative mt-2">
              마지막 요청: <span className="text-label-normal">{submitted}</span>
            </p>
          )}
        </div>
      </Section>

      <Section cat="forms" current={catTab} title="4. Select — 단일 선택 (Radix)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="text-polaris-body2 font-medium text-label-normal mb-1.5 block">정렬</label>
            <Select defaultValue="recent">
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>기본</SelectLabel>
                  <SelectItem value="recent">최근 수정순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="size">크기순</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-polaris-body2 font-medium text-label-normal mb-1.5 block">파일 형식</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="형식 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="xlsx">XLSX</SelectItem>
                <SelectItem value="pptx">PPTX</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="hwp">HWP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section cat="forms" current={catTab} title="5. Combobox — searchable Select (single + multiple)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-polaris-md">
          <Card variant="padded">
            <p className="text-polaris-caption1 text-label-alternative mb-2">single — 도시 선택</p>
            <Combobox
              options={[
                { value: 'seoul',  label: '서울', description: '대한민국 수도' },
                { value: 'busan',  label: '부산', description: '제2의 도시' },
                { value: 'incheon', label: '인천', description: '항만 도시' },
                { value: 'daegu',  label: '대구' },
                { value: 'gwangju', label: '광주' },
                { value: 'daejeon', label: '대전' },
                { value: 'ulsan', label: '울산' },
                { value: 'sejong', label: '세종' },
              ] as ComboboxOption[]}
              value={comboCity}
              onChange={setComboCity}
              placeholder="도시 선택"
              searchPlaceholder="도시 이름…"
            />
            <p className="text-polaris-helper text-label-alternative mt-2">현재: {comboCity ?? '(없음)'}</p>
          </Card>
          <Card variant="padded">
            <p className="text-polaris-caption1 text-label-alternative mb-2">multiple — 태그 선택 (groups)</p>
            <Combobox
              multiple
              options={[
                { value: 'urgent',  label: '긴급', group: '우선순위' },
                { value: 'normal',  label: '보통', group: '우선순위' },
                { value: 'low',     label: '낮음', group: '우선순위' },
                { value: 'bug',     label: '버그', group: '유형' },
                { value: 'feature', label: '기능', group: '유형' },
                { value: 'doc',     label: '문서', group: '유형' },
              ] as ComboboxOption[]}
              value={comboTags}
              onChange={setComboTags}
              placeholder="태그 선택"
            />
            <p className="text-polaris-helper text-label-alternative mt-2">선택: {comboTags.join(', ') || '(없음)'}</p>
          </Card>
        </div>
      </Section>

      <Section cat="forms" current={catTab} title="6. Checkbox & Switch — 토글 입력">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Checkbox</p>
            <Card>
              <CardBody>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-polaris-body2">
                    <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
                    이용 약관에 동의합니다
                  </label>
                  <label className="flex items-center gap-2 text-polaris-body2">
                    <Checkbox checked="indeterminate" />
                    일부 항목 선택됨 (indeterminate)
                  </label>
                  <label className="flex items-center gap-2 text-polaris-body2 text-label-alternative">
                    <Checkbox disabled />
                    비활성 상태
                  </label>
                </div>
              </CardBody>
            </Card>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Switch — 기본</p>
            <Card>
              <CardBody>
                <div className="space-y-3">
                  <label className="flex items-center justify-between text-polaris-body2">
                    알림 받기
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </label>
                  <label className="flex items-center justify-between text-polaris-body2 text-label-alternative">
                    마케팅 수신 (비활성)
                    <Switch disabled />
                  </label>
                </div>
              </CardBody>
            </Card>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Switch — label / hint / error (Checkbox 일관성)</p>
            <Stack gap={3}>
              <Switch label="이메일 알림" helperText="새 댓글이 달리면 받아봅니다." defaultChecked />
              <Switch label="다크 모드" />
              <Switch label="공개" error="권한 없음" />
            </Stack>
          </div>
        </Stack>
      </Section>

      <Section cat="forms" current={catTab} title="7. DatePicker / DateRangePicker — 날짜 선택">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="padded">
            <h3 className="text-polaris-heading4 mb-3">DatePicker (single)</h3>
            <DatePicker value={pickedDate} onChange={setPickedDate} />
            {pickedDate && (
              <p className="mt-2 text-polaris-caption1 text-label-alternative">선택: {pickedDate.toLocaleDateString('ko-KR')}</p>
            )}
          </Card>
          <Card variant="padded">
            <h3 className="text-polaris-heading4 mb-3">DateRangePicker</h3>
            <DateRangePicker value={pickedRange} onChange={setPickedRange} />
            {pickedRange?.from && (
              <p className="mt-2 text-polaris-caption1 text-label-alternative">
                {pickedRange.from.toLocaleDateString('ko-KR')}
                {pickedRange.to ? ` ~ ${pickedRange.to.toLocaleDateString('ko-KR')}` : ''}
              </p>
            )}
          </Card>
        </div>
      </Section>

      <Section cat="forms" current={catTab} title="8. DateTimeInput / TimeInput — native input wrap">
        <Card variant="padded">
          <Stack gap={4}>
            <div className="grid md:grid-cols-2 gap-polaris-md">
              <DateTimeInput
                label="만료일"
                helperText="브라우저 시간대 기준"
                value={datetimeVal}
                onChange={(e) => setDatetimeVal(e.target.value)}
              />
              <TimeInput
                label="알림 시각"
                helperText="HH:MM 24시간 표기"
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-polaris-md">
              <DateTimeInput
                label="에러 상태"
                error="유효하지 않은 일시"
                defaultValue="2099-13-32T25:99"
              />
              <TimeInput
                label="에러 상태"
                error="시각 필수"
              />
            </div>
            <p className="text-polaris-helper text-label-alternative">
              현재 값: datetime = {datetimeVal} · time = {timeVal}
            </p>
          </Stack>
        </Card>
      </Section>

      <Section cat="forms" current={catTab} title="9. FileInput / FileDropZone — 파일 업로드">
        <div className="grid md:grid-cols-2 gap-polaris-md">
          <Card variant="padded">
            <Stack gap={4}>
              <div>
                <p className="text-polaris-caption1 text-label-alternative mb-2">기본</p>
                <FileInput label="첨부 파일" />
              </div>
              <div>
                <p className="text-polaris-caption1 text-label-alternative mb-2">
                  multiple + accept + hint
                </p>
                <FileInput
                  label="이미지 업로드"
                  accept="image/*"
                  multiple
                  helperText="JPG, PNG, GIF · 각 5MB 이하"
                />
              </div>
              <div>
                <p className="text-polaris-caption1 text-label-alternative mb-2">error 상태</p>
                <FileInput
                  label="필수 첨부"
                  error="파일을 선택하세요"
                />
              </div>
            </Stack>
          </Card>

          <Card variant="padded">
            <Stack gap={3}>
              <div>
                <p className="text-polaris-caption1 text-label-alternative mb-2">
                  Drag&amp;drop · accept + maxSize 검증 + onReject 토스트
                </p>
                <FileDropZone
                  accept=".pdf,.docx"
                  multiple
                  maxSize={10 * 1024 * 1024}
                  helperText="PDF, DOCX · 각 10 MB 이하"
                  onFilesChange={(files) =>
                    pushToast('success', `${files.length}개 파일 수락됨`, files.map((f) => f.name).join(', '))
                  }
                  onReject={(rejections) =>
                    pushToast('danger', '파일 거부됨', rejections[0]?.reason)
                  }
                />
              </div>
              <div>
                <p className="text-polaris-caption1 text-label-alternative mb-2">disabled</p>
                <FileDropZone disabled prompt="현재 비활성" />
              </div>
            </Stack>
          </Card>
        </div>
      </Section>

      <Section cat="forms" current={catTab} title="10. Form — RHF + zod (사내 표준)">
        <Card variant="padded">
          <Form {...contactForm}>
            <form
              onSubmit={contactForm.handleSubmit((v) => pushToast('success', '제출됨', `${v.name} <${v.email}>`))}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl"
            >
              <FormField
                control={contactForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl><Input placeholder="홍길동" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl><Input type="email" placeholder="hong@example.com" {...field} /></FormControl>
                    <FormDescription>회신용 주소</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <Button type="submit">제출</Button>
              </div>
            </form>
          </Form>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/* NAVIGATION                                                   */}
      {/* ============================================================ */}

      <Section cat="navigation" current={catTab} title="1. Tabs — pill (default) + underline variant">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">pill (default) — 콘텐츠 panel 포함</p>
            <Tabs value={tab} onValueChange={setTab} className="max-w-xl">
              <TabsList>
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="files">파일</TabsTrigger>
                <TabsTrigger value="ai">AI</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Card><CardBody>개요 탭 내용입니다.</CardBody></Card>
              </TabsContent>
              <TabsContent value="files">
                <Card><CardBody>파일 탭 내용입니다.</CardBody></Card>
              </TabsContent>
              <TabsContent value="ai">
                <Card><CardBody>AI 탭 내용입니다.</CardBody></Card>
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">variant 토글 — pill ↔ underline</p>
            <Card variant="padded">
              <Stack direction="row" gap={2} className="mb-polaris-md">
                <Button size="sm" variant={tabVariant === 'pill' ? 'primary' : 'tertiary'}
                  onClick={() => setTabVariant('pill')}>pill</Button>
                <Button size="sm" variant={tabVariant === 'underline' ? 'primary' : 'tertiary'}
                  onClick={() => setTabVariant('underline')}>underline</Button>
              </Stack>
              <Tabs defaultValue="overview">
                <TabsList variant={tabVariant}>
                  <TabsTrigger value="overview">개요</TabsTrigger>
                  <TabsTrigger value="activity">활동</TabsTrigger>
                  <TabsTrigger value="settings">설정</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="text-polaris-body2 text-label-neutral">개요 본문</TabsContent>
                <TabsContent value="activity" className="text-polaris-body2 text-label-neutral">활동 본문</TabsContent>
                <TabsContent value="settings" className="text-polaris-body2 text-label-neutral">설정 본문</TabsContent>
              </Tabs>
            </Card>
          </div>
        </Stack>
      </Section>

      <Section cat="navigation" current={catTab} title="2. Sidebar — 좌측 내비게이션">
        <div className="rounded-polaris-lg border border-line-neutral overflow-hidden h-96 flex">
          <Sidebar width="14rem">
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 rounded-polaris-md bg-accent-brand-normal text-label-inverse items-center justify-center font-bold text-polaris-body2">P</span>
                <div className="min-w-0">
                  <div className="text-polaris-body2 font-semibold truncate">Polaris Office</div>
                  <div className="text-polaris-caption1 text-label-alternative truncate">Hae-Seok Lee</div>
                </div>
              </div>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                <SidebarItem icon={<Home className="h-4 w-4" />} label="홈" active />
                <SidebarItem icon={<FolderIcon className="h-4 w-4" />} label="폴라리스 드라이브" />
                <SidebarItem icon={<Sparkles className="h-4 w-4" />} label="NOVA" trailing={<Badge variant="secondary">AI</Badge>} />
              </SidebarSection>
              <SidebarSection title="문서">
                <SidebarItem icon={<FileText className="h-4 w-4" />} label="공유 문서" />
                <SidebarItem icon={<Star className="h-4 w-4" />} label="중요 문서" trailing={<Badge variant="neutral">12</Badge>} />
                <SidebarItem icon={<DeleteIcon className="h-4 w-4" />} label="휴지통" />
              </SidebarSection>
            </SidebarBody>
            <SidebarFooter>
              <div className="text-polaris-caption1 text-label-alternative">크레딧 6,805</div>
            </SidebarFooter>
          </Sidebar>
          <div className="flex-1 bg-fill-neutral p-4 text-polaris-body2 text-label-alternative">
            메인 영역 — 활성 항목(홈)이 accentBrand.normal.subtle 배경으로 강조됩니다.
          </div>
        </div>
      </Section>

      <Section cat="navigation" current={catTab} title="3. Navbar & NavbarItem — 상단 내비게이션">
        <Card className="overflow-hidden !p-0">
          <Navbar className="border-b-0">
            <NavbarBrand>
              <span className="inline-flex h-7 w-7 rounded-polaris-md bg-accent-brand-normal text-label-inverse items-center justify-center font-bold text-polaris-caption1">P</span>
              <span className="text-polaris-heading4 font-semibold">Polaris Office</span>
            </NavbarBrand>
            <NavbarNav>
              <NavbarItem href="#" active>홈</NavbarItem>
              <NavbarItem href="#">드라이브</NavbarItem>
              <NavbarItem href="#" icon={<Sparkles />}>NOVA</NavbarItem>
            </NavbarNav>
            <NavbarActions>
              <SimpleTooltip label="알림" side="bottom">
                <Button variant="ghost" size="sm" aria-label="알림">
                  <BellIcon className="h-4 w-4" />
                </Button>
              </SimpleTooltip>
              <SimpleTooltip label="설정" side="bottom">
                <Button variant="ghost" size="sm" aria-label="설정">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </SimpleTooltip>
              <Avatar size="sm"><AvatarFallback>이</AvatarFallback></Avatar>
            </NavbarActions>
          </Navbar>
        </Card>
      </Section>

      <Section cat="navigation" current={catTab} title="4. Breadcrumb — 경로 표시">
        <Card>
          <CardBody>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">홈</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">영업관리</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">계약</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>2026 Q1 보고서</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardBody>
        </Card>
      </Section>

      <Section cat="navigation" current={catTab} title="5. Pagination — 프리미티브 + Footer 통합 래퍼">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">primitive items + helper</p>
            <Card>
              <CardBody>
                <Pagination>
                  <PaginationPrev onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} />
                  {[1, 2, 3, 4, 5].map((n) => (
                    <PaginationItem key={n} active={page === n} onClick={() => setPage(n)}>
                      {n}
                    </PaginationItem>
                  ))}
                  <PaginationEllipsis />
                  <PaginationItem onClick={() => setPage(12)} active={page === 12}>12</PaginationItem>
                  <PaginationNext onClick={() => setPage((p) => Math.min(12, p + 1))} disabled={page === 12} />
                </Pagination>
                <p className="mt-3 text-polaris-caption1 text-label-alternative text-center">현재 페이지: {page} / 12</p>
              </CardBody>
            </Card>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">PaginationFooter — 기본 (검색 + 사이즈 셀렉터 + 인디케이터)</p>
            <Card variant="padded">
              <PaginationFooter
                page={paginationFooterPage}
                pageSize={paginationFooterSize}
                total={1234}
                onPageChange={setPaginationFooterPage}
                onPageSizeChange={(n) => {
                  setPaginationFooterSize(n);
                  setPaginationFooterPage(1);
                }}
              />
            </Card>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">PaginationFooter — 변형 (showTotal=false / 번호만 / i18n 라벨)</p>
            <Card variant="padded">
              <Stack gap={4}>
                <div>
                  <p className="text-polaris-caption1 text-label-alternative mb-2">인디케이터 숨김 (showTotal=false)</p>
                  <PaginationFooter
                    page={1}
                    pageSize={10}
                    total={45}
                    showTotal={false}
                    onPageChange={() => {}}
                    onPageSizeChange={() => {}}
                  />
                </div>
                <div>
                  <p className="text-polaris-caption1 text-label-alternative mb-2">번호만 (사이즈 셀렉터 미사용)</p>
                  <PaginationFooter
                    page={2}
                    pageSize={10}
                    total={45}
                    onPageChange={() => {}}
                  />
                </div>
                <div>
                  <p className="text-polaris-caption1 text-label-alternative mb-2">i18n 라벨 커스텀 (labels prop)</p>
                  <PaginationFooter
                    page={1}
                    pageSize={10}
                    total={50}
                    onPageChange={() => {}}
                    onPageSizeChange={() => {}}
                    labels={{
                      total: (s, e, t) => `Showing ${s}-${e} of ${t}`,
                      pageSize: 'Per page',
                    }}
                  />
                </div>
              </Stack>
            </Card>
          </div>
        </Stack>
      </Section>

      <Section cat="navigation" current={catTab} title="6. PageHeader & SectionHeader — 페이지 레이아웃">
        <Card variant="padded" className="mb-polaris-md">
          <PageHeader
            breadcrumb={
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="#">대시보드</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>문서 분석</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            }
            eyebrow="베타"
            title="문서 분석"
            description="제안서·IR 자료·계약 문서를 한 곳에서."
            actions={
              <>
                <Button variant="tertiary" size="sm">필터</Button>
                <Button size="sm" iconLeft={<PlusIcon />}>새 문서</Button>
              </>
            }
          />
        </Card>
        <Card variant="padded">
          <SectionHeader
            title="최근 활동"
            description="지난 7일"
            actions={<Button size="sm" variant="tertiary">전체 보기</Button>}
          />
          <p className="text-polaris-body2 text-label-neutral">… 섹션 본문 …</p>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/* OVERLAYS                                                     */}
      {/* ============================================================ */}

      <Section cat="overlays" current={catTab} title="1. Dialog — 모달 다이얼로그">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="tertiary">Dialog 열기</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>문서를 삭제하시겠습니까?</DialogTitle>
              <DialogDescription>
                이 작업은 되돌릴 수 없습니다. 문서가 휴지통으로 이동되며 30일 후 영구 삭제됩니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="tertiary">취소</Button>
              </DialogClose>
              <Button variant="danger">삭제</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section cat="overlays" current={catTab} title="2. Drawer — side variants (right/left/top/bottom)">
        <Stack direction="row" gap={2} wrap>
          {(['right', 'left', 'top', 'bottom'] as const).map((side) => (
            <Drawer key={side}>
              <DrawerTrigger asChild>
                <Button variant="tertiary">{side} 열기</Button>
              </DrawerTrigger>
              <DrawerContent side={side}>
                <DrawerHeader>
                  <DrawerTitle>Drawer · side="{side}"</DrawerTitle>
                  <DrawerDescription>Radix Dialog 위에 side variant만 추가한 단순한 패널입니다.</DrawerDescription>
                </DrawerHeader>
                <DrawerBody>
                  <p className="text-polaris-body2 text-label-neutral">
                    테이블 행 inspector, 필터 패널, 모바일 navigation drawer 등에 사용. focus trap·overlay·Esc 닫기는 Dialog와 동일.
                  </p>
                </DrawerBody>
                <DrawerFooter>
                  <Button variant="tertiary">취소</Button>
                  <Button>저장</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ))}
        </Stack>
      </Section>

      <Section cat="overlays" current={catTab} title="3. DropdownMenu — 액션 메뉴">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="tertiary" size="sm">
              <MoreHorizontal className="h-4 w-4" /> 더보기
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>문서 액션</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => pushToast('info', '편집 모드로 전환')}>
              <PencilLineIcon className="h-4 w-4" /> 편집
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => pushToast('info', '복제 완료')}>
              <Copy className="h-4 w-4" /> 복제
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => pushToast('info', '다운로드 시작')}>
              <DownloadIcon className="h-4 w-4" /> 다운로드
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => pushToast('danger', '문서 삭제됨')}>
              <DeleteIcon className="h-4 w-4" /> 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section cat="overlays" current={catTab} title="4. Tooltip — 툴팁 (sides + 긴 텍스트)">
        <div className="flex flex-wrap gap-3">
          <SimpleTooltip label="새 문서를 만듭니다">
            <Button size="sm">
              <PlusIcon className="h-4 w-4" /> 새 문서
            </Button>
          </SimpleTooltip>
          <SimpleTooltip label="알림 (3개)" side="bottom">
            <Button variant="ghost" size="sm" aria-label="알림">
              <BellIcon className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip label="설정" side="bottom">
            <Button variant="ghost" size="sm" aria-label="설정">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip label="도움말 — 자세한 안내는 도움말 센터에서 확인할 수 있습니다." side="right">
            <Button variant="ghost" size="sm" aria-label="도움말">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
        </div>
      </Section>

      <Section cat="overlays" current={catTab} title="5. Toast — 4 variants + imperative push">
        <div className="flex flex-wrap gap-2">
          <Button variant="tertiary" size="sm" onClick={() => pushToast('info', '새 버전이 출시되었습니다', 'v1.4.0 — 자세히 보기')}>info</Button>
          <Button variant="tertiary" size="sm" onClick={() => pushToast('success', '저장이 완료되었습니다')}>success</Button>
          <Button variant="tertiary" size="sm" onClick={() => pushToast('warning', '변경사항이 저장되지 않았습니다')}>warning</Button>
          <Button variant="tertiary" size="sm" onClick={() => pushToast('danger', '파일 업로드 실패', '네트워크 오류로 다시 시도해 주세요')}>danger</Button>
        </div>
        <p className="text-polaris-helper text-label-alternative mt-3">
          토스트 출력 영역은 페이지 root에 있어서 어떤 카테고리 탭에서 호출해도 보입니다 — 예: Polaris 탭의 CopyButton 데모에서 onCopy 콜백으로도 동작.
        </p>
      </Section>

      <Section cat="overlays" current={catTab} title="6. Alert — variants + dismissible / action">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">Variants — info / success / warning / danger</p>
            <div className="space-y-3">
              <Alert variant="info">
                <AlertTitle>새 버전이 배포되었습니다</AlertTitle>
                <AlertDescription>v0.2.0 — Tier 2 컴포넌트 7개 추가, Toast imperative API.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <AlertTitle>저장됨</AlertTitle>
                <AlertDescription>모든 변경 사항이 자동으로 저장되었습니다.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle>곧 만료됩니다</AlertTitle>
                <AlertDescription>구독 갱신을 7일 안에 완료해주세요.</AlertDescription>
              </Alert>
              <Alert variant="danger">
                <AlertTitle>업로드 실패</AlertTitle>
                <AlertDescription>파일 크기가 50MB를 초과합니다.</AlertDescription>
              </Alert>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">dismissible + action slot</p>
            <Stack gap={2}>
              <Alert variant="warning" action={<Button size="sm" variant="tertiary">재시도</Button>}>
                <AlertTitle>업로드 실패</AlertTitle>
                <AlertDescription>네트워크가 불안정합니다.</AlertDescription>
              </Alert>
              <Alert variant="info" dismissible>
                <AlertTitle>새 기능 안내</AlertTitle>
                <AlertDescription>왼쪽 사이드바에서 즐겨찾기를 추가할 수 있습니다.</AlertDescription>
              </Alert>
            </Stack>
          </div>
        </Stack>
      </Section>

      <Section cat="overlays" current={catTab} title="7. EmptyState — 기본 / 액션 / 커스텀 아이콘">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">기본 + action</p>
            <EmptyState
              title="아직 받은 문서가 없습니다"
              description="결재 요청을 받으면 여기에 표시됩니다. NOVA에게 새 문서 작성을 요청해보세요."
              action={
                <Button onClick={() => pushToast('info', 'NOVA로 이동')}>
                  <Sparkles className="h-4 w-4" /> NOVA 시작하기
                </Button>
              }
            />
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">기본 아이콘 + 커스텀 아이콘 비교</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EmptyState
                title="아직 결재 요청이 없습니다"
                description="새 요청이 도착하면 여기에 표시됩니다."
              />
              <EmptyState
                icon={<TrendingUp />}
                title="아직 데이터가 충분하지 않습니다"
                description="최소 7일치 데이터가 있어야 추세를 표시할 수 있습니다."
                action={<Button variant="tertiary">샘플 데이터 추가</Button>}
              />
            </div>
          </div>
        </Stack>
      </Section>

      <Section cat="overlays" current={catTab} title="8. CommandPalette — ⌘K 명령 검색">
        <Card variant="padded">
          <p className="text-polaris-body2 text-label-neutral mb-3">
            <kbd className="px-1.5 py-0.5 rounded-polaris-sm border border-line-neutral bg-fill-neutral text-polaris-caption1">⌘K</kbd> 또는 아래 버튼으로 열기.
          </p>
          <Button variant="tertiary" onClick={() => setCmdOpen(true)}>명령 열기</Button>
          <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
            <CommandInput placeholder="페이지 또는 액션 검색" />
            <CommandList>
              <CommandEmpty>일치하는 결과가 없습니다.</CommandEmpty>
              <CommandGroup heading="페이지">
                <CommandItem onSelect={() => { setCmdOpen(false); pushToast('info', '대시보드로 이동'); }}>대시보드</CommandItem>
                <CommandItem onSelect={() => { setCmdOpen(false); pushToast('info', '계약 목록 이동'); }}>계약 목록</CommandItem>
                <CommandItem onSelect={() => { setCmdOpen(false); pushToast('info', '고객 관리 이동'); }}>고객 관리</CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="액션">
                <CommandItem onSelect={() => { setCmdOpen(false); pushToast('success', '새 계약 생성'); }}>
                  새 계약 생성
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => { setCmdOpen(false); pushToast('info', '내보내기'); }}>
                  CSV로 내보내기
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/* DATA                                                         */}
      {/* ============================================================ */}

      <Section cat="data" current={catTab} title="1. Table primitive — densities">
        <Card>
          <CardBody>
            <p className="text-polaris-caption1 text-label-alternative mb-3">density="compact"</p>
            <Table density="compact">
              <TableHeader>
                <TableRow>
                  <TableHead>계약명</TableHead>
                  <TableHead>거래처</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">2026 Q1 SaaS 라이선스 계약</TableCell>
                  <TableCell>(주)글로벌IT</TableCell>
                  <TableCell><Badge variant="success">서명 완료</Badge></TableCell>
                  <TableCell className="text-right">₩48,000,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">컨설팅 협약 2026-A</TableCell>
                  <TableCell>(주)디지털파트너</TableCell>
                  <TableCell><Badge variant="warning">결재 대기</Badge></TableCell>
                  <TableCell className="text-right">₩12,500,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">유지보수 갱신</TableCell>
                  <TableCell>(주)테크솔루션</TableCell>
                  <TableCell><Badge variant="danger">만료</Badge></TableCell>
                  <TableCell className="text-right">₩6,000,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </Section>

      <Section cat="data" current={catTab} title="2. Table integration — Sortable + Toolbar / SelectionBar / Skeleton + 행 선택 / 행 액션">
        <Card>
          <CardBody>
            {tableSelected.length === 0 ? (
              <TableToolbar
                search={tableQuery}
                onSearchChange={setTableQuery}
                searchPlaceholder="이름·이메일 검색"
                searchDebounceMs={200}
                chips={[
                  { value: 'all', label: '전체', count: 240 },
                  { value: 'active', label: '활성', count: 198 },
                  { value: 'paused', label: '비활성', count: 42 },
                ]}
                activeChip={tableFilter}
                onChipChange={setTableFilter}
                actions={
                  <Button size="sm">
                    <PlusIcon />새 항목
                  </Button>
                }
              />
            ) : (
              <TableSelectionBar
                count={tableSelected.length}
                onCancel={() => setTableSelected([])}
                actions={
                  <>
                    <Button variant="tertiary" size="sm">내보내기</Button>
                    <Button variant="danger" size="sm">
                      <DeleteIcon />삭제
                    </Button>
                  </>
                }
              />
            )}

            <div className="mt-polaris-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={tableSelected.length === 4 ? true : tableSelected.length > 0 ? 'indeterminate' : false}
                        onCheckedChange={(v) => setTableSelected(v === true ? [1, 2, 3, 4] : [])}
                        aria-label="모두 선택"
                      />
                    </TableHead>
                    <TableHead
                      sortable
                      sortDirection={tableSort.key === 'name' ? tableSort.dir : null}
                      onSortChange={(dir) => setTableSort({ key: 'name', dir })}
                    >
                      이름
                    </TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead
                      sortable
                      sortDirection={tableSort.key === 'created' ? tableSort.dir : null}
                      onSortChange={(dir) => setTableSort({ key: 'created', dir })}
                    >
                      가입일
                    </TableHead>
                    <TableHead className="w-12 text-right">…</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 1, name: '김민수', email: 'minsu@polaris.com',  created: '2026-01-12', status: 'active' },
                    { id: 2, name: '이서연', email: 'seoyeon@polaris.com', created: '2026-02-04', status: 'active' },
                    { id: 3, name: '박정호', email: 'jungho@polaris.com',  created: '2026-03-19', status: 'paused' },
                    { id: 4, name: '최예린', email: 'yerin@polaris.com',   created: '2026-04-22', status: 'active' },
                  ].map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox
                          checked={tableSelected.includes(row.id)}
                          onCheckedChange={(v) =>
                            setTableSelected((prev) =>
                              v === true ? [...prev, row.id] : prev.filter((x) => x !== row.id)
                            )
                          }
                          aria-label={`${row.name} 선택`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-label-neutral">{row.email}</TableCell>
                      <TableCell className="text-label-alternative tabular-nums">{row.created}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" aria-label={`${row.name} 액션`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <PencilLineIcon size={16} />수정
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4" />복제
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive>
                              <DeleteIcon size={16} />삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="mt-polaris-md text-polaris-caption1 text-label-alternative">
              현재: 검색 “{tableQuery || '(없음)'}” · 필터 “{tableFilter}” · 정렬{' '}
              {tableSort.dir ? `${tableSort.key} ${tableSort.dir}` : '없음'} · 선택 {tableSelected.length}건
            </p>
          </CardBody>
        </Card>

        <p className="text-polaris-caption1 text-label-alternative mt-3 mb-2">
          로딩 상태 — `&lt;TableSkeleton&gt;` 5행 × 4열
        </p>
        <TableSkeleton rows={5} columns={4} />
      </Section>

      <Section cat="data" current={catTab} title="3. DescriptionList — inline / stacked">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="padded">
            <h3 className="text-polaris-heading4 mb-3">layout="inline" (default)</h3>
            <DescriptionList>
              <DescriptionTerm>이름</DescriptionTerm>
              <DescriptionDetails>홍길동</DescriptionDetails>
              <DescriptionTerm>이메일</DescriptionTerm>
              <DescriptionDetails>hong@polaris.example</DescriptionDetails>
              <DescriptionTerm>가입일</DescriptionTerm>
              <DescriptionDetails>2024-08-15</DescriptionDetails>
              <DescriptionTerm>상태</DescriptionTerm>
              <DescriptionDetails><Badge variant="success">활성</Badge></DescriptionDetails>
            </DescriptionList>
          </Card>
          <Card variant="padded">
            <h3 className="text-polaris-heading4 mb-3">layout="stacked"</h3>
            <DescriptionList layout="stacked">
              <div>
                <DescriptionTerm>거래처</DescriptionTerm>
                <DescriptionDetails>(주)글로벌IT 솔루션 컴퍼니 코리아</DescriptionDetails>
              </div>
              <div>
                <DescriptionTerm>설명</DescriptionTerm>
                <DescriptionDetails>2026년 Q1부터 시작되는 SaaS 라이선스 갱신 계약입니다. 사용자 250명 한도로 1년간 운영.</DescriptionDetails>
              </div>
            </DescriptionList>
          </Card>
        </div>
      </Section>

      <Section cat="data" current={catTab} title="4. Progress — determinate / indeterminate · tone · size · interactive">
        <Card variant="padded">
          <Stack gap={4}>
            <div>
              <p className="text-polaris-caption1 text-label-alternative mb-2">
                Determinate (다양한 값) — 0 / 25 / 50 / 75 / 100
              </p>
              <Stack gap={2}>
                {[0, 25, 50, 75, 100].map((v) => (
                  <Stack key={v} direction="row" align="center" gap={3}>
                    <Progress value={v} aria-label={`${v}%`} className="flex-1" />
                    <span className="w-10 text-polaris-helper text-label-alternative tabular-nums">
                      {v}%
                    </span>
                  </Stack>
                ))}
              </Stack>
            </div>

            <div>
              <p className="text-polaris-caption1 text-label-alternative mb-2">
                Tones — accent · success · warning · danger · ai
              </p>
              <Stack gap={2}>
                <Progress value={70} variant="accent" aria-label="accent" />
                <Progress value={70} variant="success" aria-label="success" />
                <Progress value={70} variant="warning" aria-label="warning" />
                <Progress value={70} variant="danger" aria-label="danger" />
                <Progress value={70} variant="ai" aria-label="ai" />
              </Stack>
            </div>

            <div>
              <p className="text-polaris-caption1 text-label-alternative mb-2">
                Sizes — sm / md / lg
              </p>
              <Stack gap={2}>
                <Progress value={60} size="sm" aria-label="sm" />
                <Progress value={60} size="md" aria-label="md" />
                <Progress value={60} size="lg" aria-label="lg" />
              </Stack>
            </div>

            <div>
              <p className="text-polaris-caption1 text-label-alternative mb-2">
                Indeterminate (셔틀 애니메이션 · prefers-reduced-motion 자동 존중)
              </p>
              <Progress aria-label="문서 분석 중" />
            </div>

            <Stack direction="row" gap={2} align="center">
              <Button size="sm" variant="tertiary" onClick={() => setProgressVal((v) => Math.max(0, v - 10))}>
                -10
              </Button>
              <Progress value={progressVal} aria-label="인터랙티브" className="flex-1" />
              <Button size="sm" variant="tertiary" onClick={() => setProgressVal((v) => Math.min(100, v + 10))}>
                +10
              </Button>
              <span className="w-10 text-polaris-helper text-label-alternative tabular-nums">
                {progressVal}%
              </span>
            </Stack>
          </Stack>
        </Card>
      </Section>

      <Section cat="data" current={catTab} title="5. CircularProgress — 라디얼 인디케이터">
        <Card variant="padded">
          <Stack direction="row" gap={6} align="center" wrap>
            <Stack direction="row" gap={3} align="center">
              <CircularProgress size="sm" value={25} aria-label="25%" />
              <CircularProgress size="md" value={50} aria-label="50%" />
              <CircularProgress size="lg" value={75} aria-label="75%" />
              <CircularProgress size="xl" value={100} tone="success" aria-label="완료" />
            </Stack>
            <Stack direction="row" gap={3} align="center">
              <CircularProgress aria-label="저장 중" />
              <CircularProgress aria-label="ai" tone="ai" />
              <CircularProgress aria-label="warning" tone="warning" value={60} />
              <CircularProgress aria-label="danger" tone="danger" value={30} />
            </Stack>
          </Stack>
        </Card>
      </Section>

      <Section cat="data" current={catTab} title="6. Stat — KPI 타일 + loading">
        <Stack gap={5}>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">기본 — Card 안에 wrap</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-polaris-md">
              <Card variant="padded">
                <Stat label="조회수" value="1,234" delta="+12%" deltaVariant="positive" />
              </Card>
              <Card variant="padded">
                <Stat label="고유 방문" value="892" delta="-3%" deltaVariant="negative" />
              </Card>
              <Card variant="padded">
                <Stat
                  label="다운로드"
                  value="148"
                  delta="+5%"
                  deltaVariant="accent"
                  icon={<DownloadIcon />}
                />
              </Card>
              <Card variant="padded">
                <Stat
                  label="차단"
                  value="7"
                  helper="지난 7일 기준"
                />
              </Card>
            </div>
          </div>
          <div>
            <p className="text-polaris-caption1 text-label-alternative mb-2">loading state</p>
            <div className="grid grid-cols-3 gap-polaris-md">
              <Card variant="padded">
                <Stat label="조회수" value="0" loading />
              </Card>
              <Card variant="padded">
                <Stat label="조회수" value="1,234" delta="+12%" deltaVariant="positive" loading />
              </Card>
              <Card variant="padded">
                <Stat label="조회수" value="1,234" delta="+12%" deltaVariant="positive" />
              </Card>
            </div>
          </div>
        </Stack>
      </Section>

      <Section cat="data" current={catTab} title="7. Accordion — 그룹 disclosure">
        <Card variant="padded">
          <Accordion type="single" collapsible defaultValue="billing">
            <AccordionItem value="billing">
              <AccordionTrigger>결제 관련</AccordionTrigger>
              <AccordionContent>월간 / 연간 결제, 영수증 발행, 환불 정책 안내.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="security">
              <AccordionTrigger>보안 / 로그인</AccordionTrigger>
              <AccordionContent>2단계 인증, SSO, 비밀번호 정책 등.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="limits">
              <AccordionTrigger>플랜 제한</AccordionTrigger>
              <AccordionContent>각 플랜의 사용자·문서·저장공간 한도.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/* POLARIS                                                      */}
      {/* ============================================================ */}

      <Section cat="polaris" current={catTab} title="1. PromptChip — 프롬프트 칩 (폴라리스 고유)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PromptChip
            icon={<SearchIcon className="h-4 w-4" />}
            onClick={() => pushToast('info', '검색 시작', '2025년 소비자 트렌드')}
          >
            2025년 소비자 트렌드를 산업별로 심층 조사해줘
          </PromptChip>
          <PromptChip
            icon={<FileText className="h-4 w-4" />}
            onClick={() => pushToast('info', '요약 시작')}
          >
            회의의 주요 내용을 한 장 분량으로 간결하게 요약해 줘
          </PromptChip>
          <PromptChip
            icon={<ImageIcon className="h-4 w-4" />}
            onClick={() => pushToast('info', '이미지 생성 시작')}
          >
            보고서 주제에 맞는 키 비주얼 이미지를 만들어줘
          </PromptChip>
        </div>
      </Section>

      <Section cat="polaris" current={catTab} title="2. CopyButton — clipboard + 1.5s 성공 피드백">
        <Card variant="padded">
          <Stack gap={3}>
            <Stack direction="row" gap={2} wrap>
              <CopyButton text="https://polaris.example.com/share/abc123">URL 복사</CopyButton>
              <CopyButton
                text="POLARIS-2026-Q1-PROPOSAL"
                variant="primary"
              >
                코드 복사
              </CopyButton>
              <CopyButton
                text="https://polaris.example.com/share/abc123"
                iconOnly
                aria-label="공유 URL 복사"
              />
              <CopyButton
                text="실패 시 onError 발화"
                variant="danger"
                size="sm"
                onCopy={() => pushToast('success', '클립보드 복사됨')}
              >
                토스트 연동
              </CopyButton>
            </Stack>
            <p className="text-polaris-helper text-label-alternative">
              버튼은 `Button` variant/size를 그대로 받음. iconOnly + aria-label로 squarification.
            </p>
          </Stack>
        </Card>
      </Section>

      <Section cat="polaris" current={catTab} title="3. Ribbon — Office 스타일 (subpath: @polaris/ui/ribbon)">
        <Card>
          <Ribbon className="!border-0">
            <RibbonTabs defaultValue="home">
              <RibbonTabList>
                <RibbonTab value="home">홈</RibbonTab>
                <RibbonTab value="insert">삽입</RibbonTab>
                <RibbonTab value="layout">레이아웃</RibbonTab>
                <RibbonTab value="review">검토</RibbonTab>
              </RibbonTabList>
              <RibbonContent value="home">
                <RibbonGroup label="붙여넣기">
                  <RibbonButton size="lg" icon={<Clipboard className="h-5 w-5" />}>붙여넣기</RibbonButton>
                </RibbonGroup>
                <RibbonSeparator />
                <RibbonGroup label="글꼴">
                  <RibbonToggleGroup
                    type="multiple"
                    value={mdMarks}
                    onValueChange={setMdMarks}
                  >
                    <RibbonToggleItem value="bold" tooltip="굵게 (⌘B)" icon={<Bold className="h-4 w-4" />} />
                    <RibbonToggleItem value="italic" tooltip="기울임 (⌘I)" icon={<Italic className="h-4 w-4" />} />
                    <RibbonToggleItem value="underline" tooltip="밑줄 (⌘U)" icon={<Underline className="h-4 w-4" />} />
                    <RibbonToggleItem value="strikethrough" tooltip="취소선" icon={<Strikethrough className="h-4 w-4" />} />
                  </RibbonToggleGroup>
                  <RibbonSplitButton
                    icon={<Type className="h-4 w-4 text-state-error" />}
                    tooltip="글자 색"
                    menuLabel="글자 색 선택"
                    menu={
                      <>
                        <DropdownMenuItem>빨강</DropdownMenuItem>
                        <DropdownMenuItem>파랑</DropdownMenuItem>
                        <DropdownMenuItem>녹색</DropdownMenuItem>
                      </>
                    }
                  />
                  <RibbonSplitButton
                    icon={<Highlighter className="h-4 w-4 text-state-warning" />}
                    tooltip="형광펜"
                    menuLabel="형광펜 색"
                    menu={
                      <>
                        <DropdownMenuItem>노랑</DropdownMenuItem>
                        <DropdownMenuItem>분홍</DropdownMenuItem>
                      </>
                    }
                  />
                </RibbonGroup>
                <RibbonSeparator />
                <RibbonGroup label="문단">
                  <RibbonToggleGroup
                    type="single"
                    value={ribbonAlign}
                    onValueChange={(v) => v && setRibbonAlign(v)}
                  >
                    <RibbonToggleItem value="left" tooltip="왼쪽 정렬" icon={<AlignLeft className="h-4 w-4" />} />
                    <RibbonToggleItem value="center" tooltip="가운데 정렬" icon={<AlignCenter className="h-4 w-4" />} />
                    <RibbonToggleItem value="right" tooltip="오른쪽 정렬" icon={<AlignRight className="h-4 w-4" />} />
                    <RibbonToggleItem value="justify" tooltip="양쪽 정렬" icon={<AlignJustify className="h-4 w-4" />} />
                  </RibbonToggleGroup>
                </RibbonGroup>
              </RibbonContent>
              <RibbonContent value="insert">
                <RibbonGroup label="요소">
                  <RibbonButton size="lg" icon={<ImageIcon className="h-5 w-5" />}>이미지</RibbonButton>
                  <RibbonButton size="lg" icon={<FileText className="h-5 w-5" />}>표</RibbonButton>
                </RibbonGroup>
              </RibbonContent>
              <RibbonContent value="layout">
                <RibbonGroup label="여백">
                  <RibbonButton tooltip="여백 설정">여백</RibbonButton>
                </RibbonGroup>
              </RibbonContent>
              <RibbonContent value="review">
                <RibbonGroup label="교정">
                  <RibbonButton tooltip="맞춤법">맞춤법</RibbonButton>
                </RibbonGroup>
              </RibbonContent>
            </RibbonTabs>
          </Ribbon>
        </Card>
      </Section>

      <Section cat="polaris" current={catTab} title="4. Ribbon — 단일 패널 (MD 에디터 케이스)">
        <Card>
          <Ribbon className="!border-0">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <RibbonGroup>
                <RibbonToggleGroup
                  type="multiple"
                  value={mdMarks}
                  onValueChange={setMdMarks}
                >
                  <RibbonToggleItem value="bold" tooltip="**굵게** (⌘B)" icon={<Bold className="h-4 w-4" />} />
                  <RibbonToggleItem value="italic" tooltip="*기울임* (⌘I)" icon={<Italic className="h-4 w-4" />} />
                  <RibbonToggleItem value="strikethrough" tooltip="~~취소선~~" icon={<Strikethrough className="h-4 w-4" />} />
                  <RibbonToggleItem value="code" tooltip="`코드` (⌘E)" icon={<Code className="h-4 w-4" />} />
                </RibbonToggleGroup>
              </RibbonGroup>
              <RibbonSeparator />
              <RibbonGroup>
                <RibbonButton tooltip="# 제목 1" icon={<Heading1 className="h-4 w-4" />} />
                <RibbonButton tooltip="## 제목 2" icon={<Heading2 className="h-4 w-4" />} />
              </RibbonGroup>
              <RibbonSeparator />
              <RibbonGroup>
                <RibbonButton tooltip="- 글머리 기호" icon={<List className="h-4 w-4" />} />
                <RibbonButton tooltip="1. 번호 매기기" icon={<ListOrdered className="h-4 w-4" />} />
                <RibbonButton tooltip="> 인용문" icon={<Quote className="h-4 w-4" />} />
              </RibbonGroup>
              <RibbonSeparator />
              <RibbonGroup>
                <RibbonButton tooltip="[링크](url) (⌘K)" icon={<LinkIcon className="h-4 w-4" />} />
              </RibbonGroup>
            </div>
          </Ribbon>
          <CardBody>
            <p className="text-polaris-caption1 text-label-alternative">
              현재 마크: {mdMarks.length === 0 ? '(없음)' : mdMarks.join(', ')}
            </p>
          </CardBody>
        </Card>
      </Section>

      <Section cat="polaris" current={catTab} title="5. 폴라리스 화면 모방 (조합 검증)">
        <Card>
          <CardHeader>
            <CardTitle>최근 문서</CardTitle>
            <CardDescription>NOVA를 통해 빠르게 작업을 시작하세요</CardDescription>
          </CardHeader>
          <CardBody>
            <NovaInput
              containerClassName="mb-4"
              onSubmit={(v) => pushToast('info', '요청 전송됨', v)}
            />
            <div className="space-y-2">
              <FileCard type="docx" name="2026 Q1 보고서.docx" meta="방금 전" />
              <FileCard type="xlsx" name="비용 정리.xlsx" meta="2시간 전" />
              <FileCard type="pdf" name="계약서.pdf" meta="어제" />
            </div>
          </CardBody>
        </Card>
      </Section>

      {/*
        Toast outlet — kept here at page root so toasts fire from ANY
        category tab (CopyButton onCopy in 'polaris', FileDropZone success
        in 'forms', DropdownMenu actions in 'overlays', …). Previously this
        sat inside the `cat="overlays"` Section and got unmounted with the
        rest of that section when the user switched tabs, which silenced
        every toast triggered from another tab. Layout.tsx already wraps
        the whole app in `<ToastProvider>` + `<ToastViewport>`, so any
        `<Toast>` rendered here is automatically portaled to the viewport.
      */}
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} duration={4000} onOpenChange={(open) => {
          if (!open) setToasts((s) => s.filter((x) => x.id !== t.id));
        }}>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
    </div>
  );
}

type SectionCategory = 'foundation' | 'forms' | 'navigation' | 'overlays' | 'data' | 'polaris';

function Section({
  title,
  cat,
  current,
  children,
}: {
  title: string;
  /** Category bucket — drives which tab this section renders under. */
  cat: SectionCategory;
  /** The currently-active tab from the parent. */
  current: SectionCategory;
  children: React.ReactNode;
}) {
  // Tab switching unmounts the inactive sections (returns null). That
  // means the demo state inside a non-active tab — e.g. an open Dialog,
  // a typed-in Textarea, a Disclosure forced open via `defaultOpen` —
  // is lost when the user tabs back. For a catalog page this is fine:
  // each section is self-contained and meant to be inspected fresh.
  // If we ever needed to preserve state across tabs, the swap is from
  // `return null` to `<section hidden={cat !== current}>` (display:none
  // keeps the React tree alive at the cost of full DOM presence).
  if (cat !== current) return null;
  return (
    <section className="mb-10">
      <h2 className="text-polaris-heading3 mb-4 text-label-normal">{title}</h2>
      {children}
    </section>
  );
}
