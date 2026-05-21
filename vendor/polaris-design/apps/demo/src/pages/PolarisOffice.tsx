/**
 * Polaris Office editor ribbon recreation — uses `@polaris/ui/ribbon` to
 * rebuild the actual https://www.polarisoffice.com/editor/po/word ribbon
 * tab-by-tab. Icons are best-effort lucide-react matches; the structural
 * fidelity (tab order, group layout, button hierarchy, labels) is exact.
 *
 * Each tab is its own component so consumers can copy-paste any one of
 * them as a starting point for their own editor ribbon.
 */
import { useState, type ReactNode } from 'react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  Input,
  FileIcon,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SimpleTooltip,
  DropdownMenuItem,
  cn,
} from '@polaris/ui';
import { ArrowLeftIcon, BellIcon, ChevronDownIcon, ChevronUpIcon, FolderIcon, HistoryIcon, MenuIcon, PencilLineIcon } from '@polaris/ui/icons';
import {
  Ribbon,
  RibbonTabs,
  RibbonTabList,
  RibbonTab,
  RibbonContent,
  RibbonGroup,
  RibbonStack,
  RibbonRow,
  RibbonSeparator,
  RibbonRowDivider,
  RibbonButton,
  RibbonSplitButton,
  RibbonMenuButton,
  RibbonToggleGroup,
  RibbonToggleItem,
} from '@polaris/ui/ribbon';
import { Star, Save, Monitor, UsersRound, HardDrive, ArrowLeftRight, WrapText, CornerDownLeft, Pilcrow, Sparkles } from 'lucide-react';

// v0.7+ — design-team ribbon icons (multi-color, native sizes 16/32).
// Every icon in `@polaris/ui/ribbon-icons` is referenced somewhere in this
// demo so the catalog page and the editor agree on the available set.
import {
  // home tab — small (16) text formatting
  CutIcon, CopyIcon, CopyFormatIcon,
  BoldIcon, ItalicIcon, Underline01Icon as UnderlineIcon,
  StrikethroughIcon, SubscriptIcon, SuperscriptIcon,
  ClearFormatIcon,
  BulletIcon, NumberingIcon, MultiLevelIcon,
  DentIcon, IndentIcon,
  FillColorIcon,
  AlignLeftIcon, AlignCenterIcon, AlignRightIcon, JustifyIcon, AlignmentIcon,
  LineSpacingIcon, ParagraphNarrowIcon, ParagraphWideIcon,
  FontSizeLargeIcon, FontSizeSmallIcon,
  ChangeCaseIcon, FindIcon, TextReplaceIcon,
  ShadeNewIcon, TextAccentcolourNewIcon, TextColorIcon, TextOutlineIcon,
  OrientationsheetIcon,
  // home — big (32)
  PasteIcon, TextFormatIcon,
  // insert / layout — big (32)
  TableIcon, ImageIcon as RibbonImageIcon, ImageOnlineIcon, ShapeIcon,
  HyperlinkIcon, BookmarkIcon, HorizontalTextboxIcon, SymbolIcon,
  PageColumnIcon, RotateRight90Icon, PageScaleIcon, PageSplitIcon,
  PageSplitSheetIcon, LineBreakIcon, MarginIcon, ImagePositionIcon,
  DirectionIcon,
  SetPageIcon, SetLayoutIcon, GroupIcon,
  MoveForwardIcon, MoveBackwardIcon, NewPageIcon, AlignLeft01Icon,
  // review — big (32)
  MemoNewIcon, MemoPaneIcon, MemoDeleteIcon, MemoNextIcon, MemoPreviousIcon,
  TrackChangesIcon, TrackShowmarkupIcon, WordCountIcon,
  ChangePreviousIcon, ChangeNextIcon,
  ApplyIcon, NoApplyIcon, SpellingCheckIcon, DocuProtectionIcon,
  // AI — big (32)
  TranslateIcon, AiGuideIcon, WebSearchIcon,
  AiChatIcon, AiRecordIcon, AiTextToImageIcon, Ai2dto3dIcon,
  AiBgDeleteIcon, AiBgChangeIcon, AiRemakeIcon, AiExpansionIcon,
  AiQualityIcon, AiStyleIcon, AiTemplateIcon, AiWriteIcon,
  AiVideoIcon, AiWordCloudIcon,
} from '@polaris/ui/ribbon-icons';

/* ================================================================== *
 * Composite icons used by ribbon buttons. These are demo-specific
 * pictograms (color picker swatches, image-with-globe overlay, …) —
 * not part of `@polaris/ui`. Define them once and reuse below.
 * ================================================================== */

/** Icon stacked over a colored underline bar — used for 글자 색 / 형광펜.
 *  Accepts any ReactNode so we can wrap a polaris ribbon-icon (which is
 *  the design-team source of truth) with the active-color indicator. */
function ColorAccentIcon({ icon, barClass }: { icon: ReactNode; barClass: string }) {
  return (
    <span className="flex flex-col items-center leading-none">
      {icon}
      <span className={`block w-3 h-0.5 mt-0.5 ${barClass}`} />
    </span>
  );
}

/** Base icon with a small overlay element pinned to a corner. */
function OverlayIcon({ base, overlay }: { base: ReactNode; overlay: ReactNode }) {
  return <span className="relative inline-flex">{base}{overlay}</span>;
}

/* ================================================================== *
 * Editor chrome (top bar above the ribbon). Pure presentation —
 * mimics the document title, save indicator, share/notify, avatar.
 * ================================================================== */

function EditorChrome() {
  return (
    <div className="flex items-center gap-2 h-12 px-3 border-b border-line-neutral bg-background-base">
      <Button variant="ghost" size="sm" aria-label="메뉴" className="!h-9 !w-9 !px-0 shrink-0">
        <MenuIcon className="h-5 w-5 text-accent-brand-normal" />
      </Button>
      <div className="flex items-center gap-1.5 text-polaris-body2 min-w-0">
        <span className="truncate">NewDocument 2026-05-07 211414.docx</span>
        <ChevronDownIcon className="h-4 w-4 text-label-alternative shrink-0" aria-hidden="true" />
      </div>
      <Button variant="ghost" size="sm" aria-label="즐겨찾기" className="!h-8 !w-8 !px-0 ml-1 shrink-0 hidden sm:inline-flex">
        <Star className="h-4 w-4 text-label-alternative" />
      </Button>
      <SimpleTooltip label="저장됨">
        <Button variant="ghost" size="sm" aria-label="저장" className="!h-8 !w-8 !px-0 shrink-0">
          <Save className="h-4 w-4 text-accent-brand-normal" />
        </Button>
      </SimpleTooltip>
      <div className="ml-auto flex items-center gap-1 shrink-0">
        {/* Compact: collapse "PC 앱으로 열기" / "공유" / "Miles (이해석)" labels
            below md so the bar fits on phones without overlapping.
            Buttons stay clickable; icons keep them recognizable. */}
        <Button variant="ghost" size="sm" aria-label="PC 앱으로 열기" className="gap-1.5">
          <Monitor className="h-4 w-4" aria-hidden="true" />
          <span className="font-semibold hidden lg:inline">PC 앱으로 열기</span>
        </Button>
        <Button variant="ghost" size="sm" aria-label="공유" className="gap-1.5">
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">공유</span>
        </Button>
        <Button variant="ghost" size="sm" aria-label="알림" className="gap-1.5">
          <BellIcon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">알림</span>
        </Button>
        <Button variant="ghost" size="sm" aria-label="Miles (이해석)" className="gap-1.5">
          <Avatar size="sm">
            <AvatarFallback>이</AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline">Miles (이해석)</span>
        </Button>
      </div>
    </div>
  );
}

/* ================================================================== *
 * 홈 — clipboard / font / paragraph / styles / find. Most diverse tab,
 * exercises every primitive (Stack, Row, Toggle, Split, Menu, Divider).
 * ================================================================== */

function HomeRibbon() {
  const [marks, setMarks] = useState<string[]>(['bold']);
  const [align, setAlign] = useState('justify');
  const [fontFamily, setFontFamily] = useState('나눔바른고딕');
  const [fontSize, setFontSize] = useState('10');

  return (
    <RibbonContent value="home">
      {/* Paste lg + cut/copy/format-paint stack — left-most cluster.
          The reference shows paste with the design team's gradient
          clipboard glyph (PasteIcon) and 3 small chevron-split buttons
          stacked next to it; cut/copy disabled until selection. */}
      <RibbonGroup>
        <RibbonSplitButton
          size="lg"
          icon={<PasteIcon size={24} />}
          tooltip="붙여넣기 (⌘V)"
          menuLabel="붙여넣기 옵션"
          menu={
            <>
              <DropdownMenuItem>일반 붙여넣기</DropdownMenuItem>
              <DropdownMenuItem>서식 없이 붙여넣기</DropdownMenuItem>
              <DropdownMenuItem>특수 붙여넣기…</DropdownMenuItem>
            </>
          }
        >
          붙여넣기
        </RibbonSplitButton>
        <RibbonStack className="ml-0.5">
          <RibbonSplitButton
            size="sm"
            disabled
            icon={<CutIcon size={14} />}
            tooltip="잘라내기"
            menuLabel="잘라내기 옵션"
            menu={<DropdownMenuItem>잘라내기 후 클립보드</DropdownMenuItem>}
          >
            잘라내기
          </RibbonSplitButton>
          <RibbonSplitButton
            size="sm"
            disabled
            icon={<CopyIcon size={14} />}
            tooltip="복사"
            menuLabel="복사 옵션"
            menu={<DropdownMenuItem>복사 후 새 위치</DropdownMenuItem>}
          >
            복사
          </RibbonSplitButton>
          <RibbonSplitButton
            size="sm"
            icon={<CopyFormatIcon size={14} />}
            tooltip="서식 복사"
            menuLabel="서식 복사 옵션"
            menu={<DropdownMenuItem>서식 복사 잠금</DropdownMenuItem>}
          >
            서식복사
          </RibbonSplitButton>
        </RibbonStack>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Font — family + size + larger/smaller / clearformat in row 1;
          B I U S X1 X2 + colors + outline + shade in row 2. Two rows
          because the reference shows a compact font cluster but B/I/U
          still need a home. */}
      <RibbonGroup>
        <RibbonStack>
          <RibbonRow>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="!h-6 w-32 !px-2 text-polaris-body2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="나눔바른고딕">나눔바른고딕</SelectItem>
                <SelectItem value="Pretendard">Pretendard</SelectItem>
                <SelectItem value="맑은 고딕">맑은 고딕</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="!h-6 w-16 ml-0.5 !px-1.5 !gap-1 text-polaris-body2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['8', '9', '10', '11', '12', '14', '16', '18', '20', '24'].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RibbonRowDivider />
            <RibbonButton tooltip="글자 크게" icon={<FontSizeLargeIcon />} />
            <RibbonButton tooltip="글자 작게" icon={<FontSizeSmallIcon />} />
            <RibbonRowDivider />
            <RibbonButton tooltip="서식 지우기" icon={<ClearFormatIcon />} />
            <RibbonSplitButton
              tooltip="대소문자"
              icon={<ChangeCaseIcon />}
              menuLabel="대소문자 옵션"
              menu={
                <>
                  <DropdownMenuItem>UPPERCASE</DropdownMenuItem>
                  <DropdownMenuItem>lowercase</DropdownMenuItem>
                  <DropdownMenuItem>Capitalize</DropdownMenuItem>
                </>
              }
            />
          </RibbonRow>
          <RibbonRow>
            <RibbonToggleGroup type="multiple" value={marks} onValueChange={setMarks}>
              <RibbonToggleItem value="bold" tooltip="굵게 (⌘B)" icon={<BoldIcon />} />
              <RibbonToggleItem value="italic" tooltip="기울임 (⌘I)" icon={<ItalicIcon />} />
              <RibbonToggleItem value="underline" tooltip="밑줄 (⌘U)" icon={<UnderlineIcon />} />
            </RibbonToggleGroup>
            <RibbonSplitButton
              icon={<StrikethroughIcon />}
              tooltip="취소선"
              menuLabel="취소선 옵션"
              menu={
                <>
                  <DropdownMenuItem>단일선</DropdownMenuItem>
                  <DropdownMenuItem>이중선</DropdownMenuItem>
                </>
              }
            />
            <RibbonRowDivider />
            <RibbonButton tooltip="아래 첨자" icon={<SubscriptIcon />} />
            <RibbonButton tooltip="위 첨자" icon={<SuperscriptIcon />} />
            <RibbonRowDivider />
            <RibbonSplitButton
              tooltip="글자 색"
              icon={<ColorAccentIcon icon={<TextColorIcon size={12} />} barClass="bg-state-error" />}
              menuLabel="글자 색"
              menu={<DropdownMenuItem>색 선택…</DropdownMenuItem>}
            />
            <RibbonSplitButton
              tooltip="강조 색"
              icon={<TextAccentcolourNewIcon />}
              menuLabel="강조 색"
              menu={<DropdownMenuItem>색 선택…</DropdownMenuItem>}
            />
            <RibbonRowDivider />
            <RibbonButton tooltip="음영" icon={<ShadeNewIcon />} />
            <RibbonButton tooltip="문자 테두리" icon={<TextOutlineIcon />} />
          </RibbonRow>
        </RibbonStack>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Lists / indent — row 1: bullet + numbered + multilevel split
          buttons; row 2: outdent + indent. Matches the reference's
          right-of-font cluster exactly. */}
      <RibbonGroup>
        <RibbonStack>
          <RibbonRow>
            <RibbonSplitButton tooltip="글머리 기호" icon={<BulletIcon />} menuLabel="글머리 기호" menu={<DropdownMenuItem>· — ▪</DropdownMenuItem>} />
            <RibbonSplitButton tooltip="번호 매기기" icon={<NumberingIcon />} menuLabel="번호 매기기" menu={<DropdownMenuItem>1. 2. 3.</DropdownMenuItem>} />
            <RibbonSplitButton tooltip="다단계 목록" icon={<MultiLevelIcon />} menuLabel="다단계 목록" menu={<DropdownMenuItem>1.1.1</DropdownMenuItem>} />
          </RibbonRow>
          <RibbonRow>
            <RibbonButton tooltip="내어쓰기" icon={<DentIcon />} />
            <RibbonButton tooltip="들여쓰기" icon={<IndentIcon />} />
          </RibbonRow>
        </RibbonStack>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Fill / character spacing / replace — compact 1-row strip.
          The fill-color icon shows the active color as a red accent
          bar (matches the reference). */}
      <RibbonGroup>
        <RibbonRow>
          <RibbonSplitButton
            tooltip="채우기 색"
            icon={<ColorAccentIcon icon={<FillColorIcon size={12} />} barClass="bg-state-error" />}
            menuLabel="채우기 색"
            menu={<DropdownMenuItem>색 선택…</DropdownMenuItem>}
          />
          <RibbonSplitButton tooltip="문자 간격" icon={<ArrowLeftRight className="h-4 w-4" />} menuLabel="문자 간격" menu={<DropdownMenuItem>좁게 / 보통 / 넓게</DropdownMenuItem>} />
          <RibbonRowDivider />
          <RibbonButton tooltip="바꾸기" icon={<TextReplaceIcon />} />
        </RibbonRow>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Alignment + paragraph spacing — 4-toggle alignment row + a
          dropdown stack for line/paragraph spacing controls. */}
      <RibbonGroup>
        <RibbonStack>
          <RibbonRow>
            <RibbonToggleGroup type="single" value={align} onValueChange={(v) => v && setAlign(v)}>
              <RibbonToggleItem value="left" tooltip="왼쪽 정렬" icon={<AlignLeftIcon />} />
              <RibbonToggleItem value="center" tooltip="가운데 정렬" icon={<AlignCenterIcon />} />
              <RibbonToggleItem value="right" tooltip="오른쪽 정렬" icon={<AlignRightIcon />} />
              <RibbonToggleItem value="justify" tooltip="양쪽 정렬" icon={<JustifyIcon />} />
              <RibbonToggleItem value="distribute" tooltip="배분 정렬" icon={<WrapText className="h-4 w-4" />} />
            </RibbonToggleGroup>
            <RibbonRowDivider />
            <RibbonSplitButton
              tooltip="정렬 옵션"
              icon={<AlignmentIcon />}
              menuLabel="정렬"
              menu={<DropdownMenuItem>모든 정렬 옵션…</DropdownMenuItem>}
            />
          </RibbonRow>
          <RibbonRow>
            <RibbonSplitButton tooltip="줄 간격" icon={<LineSpacingIcon />} menuLabel="줄 간격" menu={<DropdownMenuItem>1.0 / 1.5 / 2.0</DropdownMenuItem>} />
            <RibbonSplitButton tooltip="단락 위 간격" icon={<ParagraphNarrowIcon />} menuLabel="단락 위 간격" menu={<DropdownMenuItem>0 / 6 / 12pt</DropdownMenuItem>} />
            <RibbonSplitButton tooltip="단락 아래 간격" icon={<ParagraphWideIcon />} menuLabel="단락 아래 간격" menu={<DropdownMenuItem>0 / 6 / 12pt</DropdownMenuItem>} />
            <RibbonButton tooltip="단락 기호 표시" icon={<Pilcrow className="h-4 w-4" />} />
            <RibbonButton tooltip="줄바꿈 표시" icon={<CornerDownLeft className="h-4 w-4" />} />
          </RibbonRow>
        </RibbonStack>
      </RibbonGroup>

      <RibbonSeparator />

      {/* 스타일 — large icon-over-label using TextFormatIcon (red T glyph
          in the reference). */}
      <RibbonGroup>
        <RibbonButton size="lg" icon={<TextFormatIcon size={24} />}>스타일</RibbonButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Find + Replace — small stack on the far right of the home tab
          in the reference image. Find has a chevron split for advanced
          options. */}
      <RibbonGroup>
        <RibbonStack>
          <RibbonSplitButton size="sm" icon={<FindIcon size={14} />} tooltip="찾기" menuLabel="찾기 옵션" menu={<DropdownMenuItem>고급 찾기…</DropdownMenuItem>}>
            찾기
          </RibbonSplitButton>
          <RibbonButton size="sm" icon={<TextReplaceIcon size={14} />} tooltip="바꾸기">
            바꾸기
          </RibbonButton>
        </RibbonStack>
      </RibbonGroup>
    </RibbonContent>
  );
}

/* ================================================================== *
 * 삽입 — pages / images / shapes / hyperlinks / symbols. All `lg`
 * buttons; each in its own group (no labels because each group has a
 * single button — Office's convention).
 * ================================================================== */

function InsertRibbon() {
  return (
    <RibbonContent value="insert">
      {/* Group 1 — page-level inserts. The reference shows these two
          buttons clustered tight (no inner separator), then a divider
          before the table/image/shape group. */}
      <RibbonGroup>
        <RibbonButton size="lg" icon={<NewPageIcon size={24} />}>새{'\n'}페이지</RibbonButton>
        <RibbonButton size="lg" icon={<PageSplitSheetIcon size={24} />}>페이지{'\n'}나누기</RibbonButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 2 — table / image / shape. Shape is the only split
          button (chevron-down for shape gallery). */}
      <RibbonGroup>
        <RibbonButton size="lg" icon={<TableIcon size={24} />}>표</RibbonButton>
        <RibbonButton size="lg" icon={<RibbonImageIcon size={24} />}>그림</RibbonButton>
        <RibbonButton size="lg" icon={<ImageOnlineIcon size={24} />}>온라인{'\n'}그림</RibbonButton>
        <RibbonSplitButton size="lg" icon={<ShapeIcon size={24} />} menuLabel="도형 선택" menu={
          <>
            <DropdownMenuItem>사각형</DropdownMenuItem>
            <DropdownMenuItem>원</DropdownMenuItem>
            <DropdownMenuItem>화살표</DropdownMenuItem>
          </>
        }>도형</RibbonSplitButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 3 — navigational inserts. Bookmark icon gets a small red
          marker overlay (matches the reference). */}
      <RibbonGroup>
        <RibbonButton size="lg" icon={<HyperlinkIcon size={24} />}>하이퍼{'\n'}링크</RibbonButton>
        <RibbonButton size="lg" icon={
          <OverlayIcon
            base={<BookmarkIcon size={24} />}
            overlay={<span className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-1 bg-state-error" aria-hidden="true" />}
          />
        }>책갈피</RibbonButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 4 — text-box (split with vertical/horizontal options) +
          symbol. Reference shows these in the same group. */}
      <RibbonGroup>
        <RibbonSplitButton size="lg" icon={<HorizontalTextboxIcon size={24} />} menuLabel="텍스트 상자 종류" menu={
          <>
            <DropdownMenuItem>가로 텍스트 상자</DropdownMenuItem>
            <DropdownMenuItem>세로 텍스트 상자</DropdownMenuItem>
          </>
        }>텍스트{'\n'}상자</RibbonSplitButton>
        <RibbonButton size="lg" icon={<SymbolIcon size={24} />}>기호</RibbonButton>
      </RibbonGroup>
    </RibbonContent>
  );
}

/* ================================================================== *
 * 레이아웃 — page setup + image positioning. All option-style controls,
 * so the dominant primitive here is `RibbonMenuButton` (chevron-only,
 * no main action).
 * ================================================================== */

function LayoutRibbon() {
  return (
    <RibbonContent value="layout">
      {/* Group 1 — page-level layout (7 buttons per the reference).
          용지 방향 menu also exposes "글자 방향" with DirectionIcon so
          the (otherwise standalone-button) design icon stays wired up
          without adding a button the reference doesn't have. */}
      <RibbonGroup>
        <RibbonMenuButton icon={<MarginIcon size={24} />} menu={<DropdownMenuItem>좁게 / 보통 / 넓게</DropdownMenuItem>}>여백</RibbonMenuButton>
        <RibbonMenuButton
          icon={<OrientationsheetIcon />}
          menu={
            <>
              <DropdownMenuItem>세로</DropdownMenuItem>
              <DropdownMenuItem>가로</DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <DirectionIcon size={16} aria-hidden="true" /> 글자 방향 설정…
              </DropdownMenuItem>
            </>
          }
        >용지{'\n'}방향</RibbonMenuButton>
        <RibbonMenuButton icon={<PageScaleIcon size={24} />} menu={<><DropdownMenuItem>A4</DropdownMenuItem><DropdownMenuItem>Letter</DropdownMenuItem></>}>크기</RibbonMenuButton>
        <RibbonMenuButton icon={<PageColumnIcon size={24} />} menu={<><DropdownMenuItem>1단</DropdownMenuItem><DropdownMenuItem>2단</DropdownMenuItem><DropdownMenuItem>3단</DropdownMenuItem></>}>단</RibbonMenuButton>
        <RibbonMenuButton
          icon={<PageSplitIcon size={24} />}
          menu={
            <>
              <DropdownMenuItem className="gap-2">
                <PageSplitSheetIcon size={16} aria-hidden="true" /> 페이지 나누기
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <LineBreakIcon size={16} aria-hidden="true" /> 줄 나누기
              </DropdownMenuItem>
              <DropdownMenuItem>단 나누기</DropdownMenuItem>
              <DropdownMenuItem>구역 나누기</DropdownMenuItem>
            </>
          }
        >나누기</RibbonMenuButton>
        <RibbonButton size="lg" icon={<SetPageIcon size={24} />}>페이지{'\n'}설정</RibbonButton>
        <RibbonButton size="lg" icon={<SetLayoutIcon size={24} />}>레이아웃{'\n'}설정</RibbonButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 2 — image-related, disabled until an image is selected
          (matches the reference's grayed-out cluster). */}
      <RibbonGroup>
        <RibbonMenuButton disabled icon={<ImagePositionIcon size={24} />} menu={<DropdownMenuItem>위치 선택</DropdownMenuItem>}>위치</RibbonMenuButton>
        <RibbonMenuButton disabled icon={<WrapText className="h-6 w-6" />} menu={<DropdownMenuItem>옵션</DropdownMenuItem>}>텍스트{'\n'}줄 바꿈</RibbonMenuButton>
        <RibbonMenuButton disabled icon={<GroupIcon size={24} />} menu={<DropdownMenuItem>그룹/해제</DropdownMenuItem>}>그룹</RibbonMenuButton>
        <RibbonMenuButton disabled icon={<MoveForwardIcon size={24} />} menu={<DropdownMenuItem>맨 앞으로</DropdownMenuItem>}>앞으로{'\n'}가져오기</RibbonMenuButton>
        <RibbonMenuButton disabled icon={<MoveBackwardIcon size={24} />} menu={<DropdownMenuItem>맨 뒤로</DropdownMenuItem>}>뒤로{'\n'}보내기</RibbonMenuButton>
        <RibbonMenuButton disabled icon={<AlignLeft01Icon size={24} />} menu={<DropdownMenuItem>왼쪽/오른쪽/위/아래</DropdownMenuItem>}>맞춤</RibbonMenuButton>
        <RibbonMenuButton disabled icon={<RotateRight90Icon size={24} />} menu={<><DropdownMenuItem>90° 회전</DropdownMenuItem><DropdownMenuItem>180° 회전</DropdownMenuItem></>}>회전</RibbonMenuButton>
      </RibbonGroup>
    </RibbonContent>
  );
}

/* ================================================================== *
 * 검토 — comments, change-tracking, accept/reject. Demonstrates an
 * `lg` toggle (변경내용 추적), `lg` split buttons, and an inline
 * `<Select>` placed next to ribbon buttons.
 * ================================================================== */

function ReviewRibbon() {
  const [trackChanges, setTrackChanges] = useState<string[]>(['track']);
  const [reviewView, setReviewView] = useState('all');

  return (
    <RibbonContent value="review">
      {/* Group 1 — word count + memo navigation. The reference shows
          단어 개수 alone followed by 5 memo controls, all in the same
          spacing rhythm (treated as one group).
          단어 개수 split menu carries SpellingCheckIcon (맞춤법 검사) so
          the design icon stays referenced without adding a button the
          reference doesn't have. */}
      <RibbonGroup>
        <RibbonSplitButton
          size="lg"
          icon={<WordCountIcon size={24} />}
          menuLabel="문서 검사 옵션"
          menu={
            <>
              <DropdownMenuItem>단어 개수 표시</DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <SpellingCheckIcon size={16} aria-hidden="true" /> 맞춤법 검사
              </DropdownMenuItem>
            </>
          }
        >단어{'\n'}개수</RibbonSplitButton>
        <RibbonButton size="lg" icon={<MemoNewIcon size={24} />}>새{'\n'}메모</RibbonButton>
        <RibbonSplitButton size="lg" disabled icon={<MemoDeleteIcon size={24} />} menuLabel="삭제 옵션" menu={<><DropdownMenuItem>삭제</DropdownMenuItem><DropdownMenuItem>모두 삭제</DropdownMenuItem></>}>삭제</RibbonSplitButton>
        <RibbonButton size="lg" disabled icon={<MemoPreviousIcon size={24} />}>이전</RibbonButton>
        <RibbonButton size="lg" disabled icon={<MemoNextIcon size={24} />}>다음</RibbonButton>
        <RibbonButton size="lg" icon={<MemoPaneIcon size={24} />}>메모{'\n'}표시</RibbonButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 2 — track changes + show markup + view selector.
          변경내용 표시 menu carries DocuProtectionIcon (문서 보호) as a
          related option so its design icon stays wired up. */}
      <RibbonGroup>
        <RibbonToggleGroup type="multiple" value={trackChanges} onValueChange={setTrackChanges}>
          <RibbonToggleItem value="track" size="lg" tooltip="변경내용 추적" icon={<TrackChangesIcon size={24} />}>변경내용{'\n'}추적</RibbonToggleItem>
        </RibbonToggleGroup>
        <RibbonSplitButton
          size="lg"
          icon={<TrackShowmarkupIcon size={24} />}
          menuLabel="변경내용 표시 옵션"
          menu={
            <>
              <DropdownMenuItem>모든 변경 사항</DropdownMenuItem>
              <DropdownMenuItem>최종본</DropdownMenuItem>
              <DropdownMenuItem>원본</DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <DocuProtectionIcon size={16} aria-hidden="true" /> 문서 보호 설정…
              </DropdownMenuItem>
            </>
          }
        >변경내용{'\n'}표시</RibbonSplitButton>
        <Select value={reviewView} onValueChange={setReviewView}>
          <SelectTrigger className="!h-8 w-36 text-polaris-body2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">메모 및 변경 내용 모두</SelectItem>
            <SelectItem value="changes">변경 내용만</SelectItem>
            <SelectItem value="comments">메모만</SelectItem>
          </SelectContent>
        </Select>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 3 — accept/reject + change navigation. */}
      <RibbonGroup>
        <RibbonSplitButton size="lg" icon={<ApplyIcon size={24} />} menuLabel="적용 옵션" menu={
          <>
            <DropdownMenuItem>이 변경 사항 적용</DropdownMenuItem>
            <DropdownMenuItem>모두 적용</DropdownMenuItem>
          </>
        }>적용</RibbonSplitButton>
        <RibbonSplitButton size="lg" icon={<NoApplyIcon size={24} />} menuLabel="취소 옵션" menu={
          <>
            <DropdownMenuItem>이 변경 사항 취소</DropdownMenuItem>
            <DropdownMenuItem>모두 취소</DropdownMenuItem>
          </>
        }>취소</RibbonSplitButton>
        <RibbonButton size="lg" disabled icon={<ChangePreviousIcon size={24} />}>이전</RibbonButton>
        <RibbonButton size="lg" disabled icon={<ChangeNextIcon size={24} />}>다음</RibbonButton>
      </RibbonGroup>
    </RibbonContent>
  );
}

/* ================================================================== *
 * AI 도구 — purely `lg` buttons with composite icons (badges, sparkles
 * overlay) signalling AI-powered actions. Mostly a showcase for
 * `OverlayIcon` patterns.
 * ================================================================== */

function AIToolsRibbon() {
  return (
    <RibbonContent value="ai">
      {/* Group 1 — chat / search / write / translate / wordcloud.
          Several have small status pips (red dot for "new"/"alert"
          state) overlaid on the design icon — matches the reference. */}
      <RibbonGroup>
        <RibbonButton size="lg" icon={
          <OverlayIcon
            base={<AiChatIcon size={24} />}
            overlay={<Sparkles className="h-3 w-3 absolute -top-1 -left-1 text-ai-normal" />}
          />
        }>NOVA{'\n'}AI 채팅</RibbonButton>
        <RibbonButton size="lg" icon={
          <OverlayIcon
            base={<WebSearchIcon size={24} />}
            overlay={<span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-polaris-pill bg-state-error" aria-hidden="true" />}
          />
        }>웹{'\n'}검색</RibbonButton>
        <RibbonButton size="lg" icon={
          <OverlayIcon
            base={<AiWriteIcon size={24} />}
            overlay={<PencilLineIcon className="h-3 w-3 absolute -bottom-0.5 -right-0.5 text-ai-normal" />}
          />
        }>AI{'\n'}Write</RibbonButton>
        <RibbonButton size="lg" icon={
          <OverlayIcon
            base={<TranslateIcon size={24} />}
            overlay={<span className="absolute -top-1 -right-1 h-2 w-2 rounded-polaris-pill bg-state-error" aria-hidden="true" />}
          />
        }>번역</RibbonButton>
        <RibbonButton size="lg" icon={<AiWordCloudIcon size={24} />}>워드{'\n'}클라우드</RibbonButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 2 — dictation, alone in its own group (per reference). */}
      <RibbonGroup>
        <RibbonButton size="lg" icon={
          <OverlayIcon
            base={<AiRecordIcon size={24} />}
            overlay={<span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-polaris-pill bg-state-error" aria-hidden="true" />}
          />
        }>받아쓰기</RibbonButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 3 — image-generation gallery. The reference shows
          8 image AI features in a tight cluster (no inner separators). */}
      <RibbonGroup>
        <RibbonButton size="lg" icon={<AiTextToImageIcon size={24} />}>Text to{'\n'}Image</RibbonButton>
        <RibbonButton size="lg" icon={<Ai2dto3dIcon size={24} />}>2D→3D{'\n'}변환</RibbonButton>
        <RibbonButton size="lg" icon={<AiBgDeleteIcon size={24} />}>배경{'\n'}제거</RibbonButton>
        <RibbonButton size="lg" icon={<AiBgChangeIcon size={24} />}>배경{'\n'}변경</RibbonButton>
        <RibbonButton size="lg" icon={<AiRemakeIcon size={24} />}>이미지{'\n'}리메이크</RibbonButton>
        <RibbonButton size="lg" icon={<AiExpansionIcon size={24} />}>이미지{'\n'}확장</RibbonButton>
        <RibbonButton size="lg" icon={<AiQualityIcon size={24} />}>해상도{'\n'}향상</RibbonButton>
        <RibbonButton size="lg" icon={<AiStyleIcon size={24} />}>스타일{'\n'}변환</RibbonButton>
      </RibbonGroup>

      <RibbonSeparator />

      {/* Group 4 — guide / help. The reference shows a single button.
          We expose the (otherwise unused) AI 비디오 / AI 템플릿 design
          icons as menu items in a "더 보기" gallery so the design system
          still showcases all 91 ribbon icons end-to-end. */}
      <RibbonGroup>
        <RibbonSplitButton
          size="lg"
          icon={<AiGuideIcon size={24} />}
          menuLabel="AI 기능 갤러리"
          menu={
            <>
              <DropdownMenuItem className="gap-2">
                <AiVideoIcon size={16} aria-hidden="true" /> AI 비디오 (베타)
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <AiTemplateIcon size={16} aria-hidden="true" /> AI 템플릿 갤러리
              </DropdownMenuItem>
              <DropdownMenuItem>전체 사용자 가이드…</DropdownMenuItem>
            </>
          }
        >AI 도구{'\n'}사용자 가이드</RibbonSplitButton>
      </RibbonGroup>
    </RibbonContent>
  );
}

function PlaceholderTab({ value, label }: { value: string; label: string }) {
  return (
    <RibbonContent value={value}>
      <div className="px-4 py-3 text-polaris-body2 text-label-alternative">{label} (생략)</div>
    </RibbonContent>
  );
}

/* ================================================================== *
 * 파일 탭 — Office "backstage view". Unlike other tabs which render
 * controls inside the ribbon panel, the file tab takes over the full
 * window. Left drawer = sections; right pane = section content.
 * ================================================================== */

type FilePane = 'new' | 'open' | 'download' | 'save-drive' | 'share';

const FILE_NAV: Array<{ id: FilePane; label: string }> = [
  { id: 'new', label: '새 문서' },
  { id: 'open', label: '문서 열기' },
  { id: 'download', label: '다운로드' },
  { id: 'save-drive', label: '폴라리스 드라이브에 저장' },
  { id: 'share', label: '공유하기' },
];

function NewDocPane() {
  const docs: Array<{
    type: 'docx' | 'xlsx' | 'pptx';
    title: string;
    desc: string;
  }> = [
    { type: 'docx', title: '워드', desc: 'docx 확장자의 워드 문서를 만듭니다.' },
    { type: 'xlsx', title: '시트', desc: 'xlsx 확장자의 시트 문서를 만듭니다.' },
    { type: 'pptx', title: '슬라이드', desc: 'pptx 확장자의 슬라이드 문서를 만듭니다.' },
  ];
  return (
    <ul className="space-y-1">
      {docs.map((doc) => (
        <li key={doc.type}>
          <Button
            variant="ghost"
            className="!h-auto w-full !justify-start !py-3 !px-4 gap-4 rounded-polaris-md hover:bg-fill-neutral text-left"
          >
            <FileIcon type={doc.type} size={40} />
            <span className="flex flex-col items-start min-w-0">
              <span className="text-polaris-body2">{doc.title}</span>
              <span className="text-polaris-caption1 text-label-alternative truncate">{doc.desc}</span>
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
}

function OpenDocPane() {
  // 배열 안 아이콘이 lucide(Star/Monitor/UsersRound/HardDrive)와 polaris
  // (HistoryIcon)의 mix — 둘 다 className/aria-hidden 인터페이스가 동일
  // 하므로 React.ElementType으로 widen.
  const places: Array<{ icon: React.ElementType; iconClass: string; label: string }> = [
    { icon: HistoryIcon, iconClass: 'text-label-alternative', label: '최근 문서' },
    { icon: Monitor, iconClass: 'text-label-alternative', label: '내 컴퓨터' },
    { icon: HardDrive, iconClass: 'text-accent-brand-normal', label: '폴라리스 드라이브' },
    { icon: UsersRound, iconClass: 'text-state-success', label: '공유 문서' },
    { icon: Star, iconClass: 'text-state-warning fill-state-warning', label: '중요 문서' },
  ];
  return (
    <ul className="space-y-1">
      {places.map((place, idx) => {
        const Icon = place.icon;
        const active = idx === 0 || idx === 2; // demo: 최근 문서 + 폴라리스 드라이브 highlighted
        return (
          <li key={place.label}>
            <Button
              variant="ghost"
              className={cn(
                '!h-auto w-full !justify-start !py-3 !px-4 gap-3 rounded-polaris-md text-left',
                active ? 'bg-accent-brand-normal-subtle hover:bg-accent-brand-normal-subtle' : 'hover:bg-fill-neutral'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', place.iconClass)} aria-hidden="true" />
              <span className="text-polaris-body2">{place.label}</span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function DownloadPane() {
  return (
    <div className="space-y-3 max-w-md">
      <p className="text-polaris-body2 text-label-neutral">
        현재 문서를 로컬에 다운로드합니다. 형식을 선택하세요.
      </p>
      <ul className="space-y-1">
        {(['docx', 'pdf'] as const).map((type) => (
          <li key={type}>
            <Button
              variant="ghost"
              className="!h-auto w-full !justify-start !py-3 !px-4 gap-4 rounded-polaris-md hover:bg-fill-neutral text-left"
            >
              <FileIcon type={type} size={40} />
              <span className="text-polaris-body2">
                {type.toUpperCase()}으로 다운로드
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SaveToDrivePane() {
  return (
    <div className="space-y-4 max-w-md">
      <p className="text-polaris-body2 text-label-neutral">
        폴라리스 드라이브의 위치를 선택하세요. 변경 사항이 자동으로 동기화됩니다.
      </p>
      <Input label="파일 이름" defaultValue="NewDocument 2026-05-07 211414" />
      <div className="flex items-center gap-2 px-3 py-2 rounded-polaris-md border border-line-neutral bg-fill-neutral text-polaris-body2">
        <FolderIcon className="h-4 w-4 text-label-alternative" aria-hidden="true" />
        <span className="text-label-neutral">/내 드라이브/문서</span>
      </div>
      <Button variant="primary" className="w-full">저장</Button>
    </div>
  );
}

function SharePane() {
  return (
    <div className="space-y-4 max-w-md">
      <p className="text-polaris-body2 text-label-neutral">
        링크 또는 이메일로 다른 사람과 함께 편집할 수 있습니다.
      </p>
      <Input label="공유할 사람" placeholder="이메일 주소를 입력하세요" />
      <div className="flex items-center justify-between px-3 py-2.5 rounded-polaris-md border border-line-neutral">
        <div className="flex items-center gap-2">
          <UsersRound className="h-4 w-4 text-label-alternative" aria-hidden="true" />
          <span className="text-polaris-body2">링크가 있는 모든 사람</span>
        </div>
        <Badge variant="neutral">보기 전용</Badge>
      </div>
      <Button variant="tertiary" className="w-full">링크 복사</Button>
    </div>
  );
}

function FileBackstage({ onClose }: { onClose: () => void }) {
  const [pane, setPane] = useState<FilePane>('new');
  const current = FILE_NAV.find((n) => n.id === pane);

  return (
    // EditorChrome 높이(h-12 = 48px = 3rem)를 viewport에서 빼서 backstage가
    // 정확히 그 아래 영역을 차지. Tailwind 임의값(`h-[calc(...)]`)은 폴라리스
    // lint 룰에 걸리므로 CSS 변수로 height를 노출 (의미 있는 이름) + 인라인
    // style로 적용. 만약 향후 chrome 높이가 토큰화되면 이 var만 갱신.
    <div
      className="flex bg-background-base"
      style={
        {
          '--editor-chrome-h': '3rem',
          // eslint-disable-next-line @polaris/no-non-polaris-css-var -- 데모 전용 inline layout var (chrome 높이), polaris semantic 토큰으로 굳히기엔 너무 specific
          height: 'calc(100vh - var(--editor-chrome-h))',
        } as React.CSSProperties
      }
    >
      {/* Left drawer */}
      <aside className="w-60 shrink-0 border-r border-line-neutral bg-fill-neutral flex flex-col">
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="문서로 돌아가기"
            className="!h-9 !w-9 !px-0"
          >
            <ArrowLeftIcon className="h-5 w-5 text-accent-brand-normal" />
          </Button>
        </div>
        <nav aria-label="파일 메뉴" className="px-2 pb-4">
          <ul className="space-y-0.5">
            {FILE_NAV.map((item) => (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  onClick={() => setPane(item.id)}
                  aria-current={pane === item.id ? 'page' : undefined}
                  className={cn(
                    'w-full !justify-start !px-3 !py-2 !h-auto rounded-polaris-md text-left text-polaris-body2 font-normal',
                    // Active state: brand-tinted background + brand text color.
                    // (Polaris Office의 실제 파일 메뉴는 active 상태에서 bold를
                    // 쓰지 않음 — 배경/색만으로 선택 표시.)
                    pane === item.id
                      ? '!bg-accent-brand-normal-subtle !text-accent-brand-normal'
                      : '!text-label-neutral hover:!bg-fill-neutral'
                  )}
                >
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Right detail pane */}
      <main className="flex-1 px-8 py-6 overflow-y-auto">
        <h1 className="text-polaris-heading2 mb-6 text-label-normal">{current?.label}</h1>
        {pane === 'new' && <NewDocPane />}
        {pane === 'open' && <OpenDocPane />}
        {pane === 'download' && <DownloadPane />}
        {pane === 'save-drive' && <SaveToDrivePane />}
        {pane === 'share' && <SharePane />}
      </main>
    </div>
  );
}

/* ================================================================== *
 * Main page — composes the chrome, the tabbed ribbon, and a canvas
 * placeholder. Only `activeTab` lives at this level; per-tab state is
 * encapsulated in each tab component.
 * ================================================================== */

export default function PolarisOffice() {
  const [activeTab, setActiveTab] = useState('home');

  // 파일 탭은 다른 탭과 달리 ribbon 영역이 아닌 backstage view로 화면을
  // 가져갑니다 (Office 패턴). EditorChrome은 유지하되 ribbon + canvas는
  // 숨기고 그 자리에 left drawer + right detail을 표시.
  if (activeTab === 'file') {
    return (
      <div className="bg-fill-neutral">
        <EditorChrome />
        <FileBackstage onClose={() => setActiveTab('home')} />
      </div>
    );
  }

  return (
    <div className="bg-fill-neutral">
      <EditorChrome />

      <Ribbon className="!border-b-2">
        <RibbonTabs value={activeTab} onValueChange={setActiveTab}>
          {/* The tablist + collapse button sit on the same baseline, but
              ARIA's `role="tablist"` should only contain `role="tab"`
              children. Wrap them in a flex parent and pull the
              border-bottom up to the wrapper so the visual line stays
              continuous while keeping the collapse affordance outside
              the Radix tablist. */}
          <div className="flex items-center border-b border-line-neutral">
            <RibbonTabList className="!border-b-0 flex-1 min-w-0">
              <RibbonTab value="file">파일</RibbonTab>
              <RibbonTab value="home">홈</RibbonTab>
              <RibbonTab value="insert">삽입</RibbonTab>
              <RibbonTab value="layout">레이아웃</RibbonTab>
              <RibbonTab value="review">검토</RibbonTab>
              <RibbonTab value="view">보기</RibbonTab>
              <RibbonTab value="pen">펜</RibbonTab>
              <RibbonTab value="ai" className="relative pr-3">
                AI 도구
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-polaris-pill bg-state-error" aria-hidden="true" />
              </RibbonTab>
            </RibbonTabList>
            <Button variant="ghost" size="sm" aria-label="리본 접기" className="!h-8 !w-8 !px-0 mr-2 shrink-0">
              <ChevronUpIcon className="h-4 w-4 text-label-alternative" />
            </Button>
          </div>

          <HomeRibbon />
          <InsertRibbon />
          <LayoutRibbon />
          <ReviewRibbon />
          <AIToolsRibbon />

          <PlaceholderTab value="file" label="파일 메뉴" />
          <PlaceholderTab value="view" label="보기 메뉴" />
          <PlaceholderTab value="pen" label="펜 메뉴" />
        </RibbonTabs>
      </Ribbon>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        <Card variant="padded">
          <div className="flex items-center gap-2 mb-4 text-polaris-caption1 text-label-alternative">
            <Badge variant="secondary">데모</Badge>
            현재 탭: {activeTab}
          </div>
          <h1 className="text-polaris-title mb-4 text-label-normal">
            폴라리스 오피스 리본 재현
          </h1>
          <p className="text-polaris-body1 text-label-neutral mb-2">
            이 화면은 <code className="font-polaris-mono text-polaris-body2 bg-fill-neutral px-1 rounded-polaris-sm">@polaris/ui/ribbon</code>의 컴포넌트만으로 구성된
            폴라리스 오피스 워드 에디터의 리본 메뉴 모형입니다.
          </p>
          <p className="text-polaris-body2 text-label-alternative">
            상단의 탭(파일·홈·삽입·레이아웃·검토·보기·펜·AI 도구)을 클릭해 그룹과 컨트롤 구성을 확인할 수 있습니다.
            아이콘은 디자인팀 ribbon-icon 세트(<code className="font-polaris-mono text-polaris-body2 bg-fill-neutral px-1 rounded-polaris-sm">@polaris/ui/ribbon-icons</code>) 91종을 사용하며,
            모든 색상은 v0.7 시맨틱 토큰(<code className="font-polaris-mono text-polaris-body2 bg-fill-neutral px-1 rounded-polaris-sm">accentBrand.*</code>·<code className="font-polaris-mono text-polaris-body2 bg-fill-neutral px-1 rounded-polaris-sm">state.*</code>·<code className="font-polaris-mono text-polaris-body2 bg-fill-neutral px-1 rounded-polaris-sm">label.*</code>)으로 입혀졌습니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
