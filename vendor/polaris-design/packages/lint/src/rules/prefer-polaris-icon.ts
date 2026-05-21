import type { Rule } from 'eslint';

/**
 * Suggests `@polaris/ui/icons` over `lucide-react` when the design
 * team's set has the equivalent icon. The polaris icon set is the
 * authoritative source — sticking to it keeps the visual language
 * consistent across services.
 *
 * The lucide → polaris mapping below is the union we shipped in
 * `assets/svg/icons/`. Lucide names that don't have a polaris twin
 * pass through silently.
 *
 * Severity: `warn` (not `error`) — lucide is still installed for the
 * leftover icons (Bold / Italic / Loader2 etc.). Suppress per line
 * with `// eslint-disable-next-line @polaris/prefer-polaris-icon`.
 */

/** lucide-react named export → polaris equivalent component name. */
const LUCIDE_TO_POLARIS: Record<string, string> = {
  X: 'CloseIcon',
  Check: 'CheckIcon',
  Minus: 'MinusIcon',
  Plus: 'PlusIcon',
  Search: 'SearchIcon',
  Send: 'SendIcon',
  Bell: 'BellIcon',
  ChevronDown: 'ChevronDownIcon',
  ChevronUp: 'ChevronUpIcon',
  ChevronLeft: 'ChevronLeftIcon',
  ChevronRight: 'ChevronRightIcon',
  ArrowDown: 'ArrowDownIcon',
  ArrowUp: 'ArrowUpIcon',
  ArrowLeft: 'ArrowLeftIcon',
  ArrowRight: 'ArrowRightIcon',
  Trash: 'DeleteIcon',
  Trash2: 'DeleteIcon',
  Settings: 'SettingsIcon',
  Cog: 'SettingsIcon',
  User: 'UserIcon',
  Users: 'UserIcon',
  Folder: 'FolderIcon',
  File: 'FileIcon',
  FilePlus: 'FilePlusIcon',
  Download: 'DownloadIcon',
  Upload: 'UploadIcon',
  RefreshCw: 'RefreshIcon',
  RotateCw: 'RefreshIcon',
  Filter: 'FilterIcon',
  Menu: 'MenuIcon',
  MessageSquare: 'MessageIcon',
  MessageCircle: 'MessageIcon',
  Image: 'ImageIcon',
  Cloud: 'CloudIcon',
  Globe: 'EarthIcon',
  History: 'HistoryIcon',
  Edit: 'PencilLineIcon',
  Edit2: 'PencilLineIcon',
  Edit3: 'PencilLineIcon',
  Pencil: 'PencilLineIcon',
  Share: 'ShareIcon',
  Share2: 'ShareIcon',
  ExternalLink: 'ExternalLinkIcon',
  Languages: 'TranslateIcon',
  Undo: 'UndoIcon',
  Undo2: 'UndoIcon',
  Redo: 'RedoIcon',
  Redo2: 'RedoIcon',
  Maximize: 'ExpandIcon',
  Maximize2: 'ExpandIcon',
  Minimize: 'ReductionIcon',
  Minimize2: 'ReductionIcon',
  AlertCircle: 'ErrorIcon',
  XCircle: 'CircleXIcon',
  CheckCircle: 'CircleCheckCircleIcon',
  Info: 'InfoCircleIcon',
};

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `@polaris/ui/icons` components over `lucide-react` named imports when the design team has shipped an equivalent. Lucide remains valid for icons polaris does not cover (Loader2, Sparkles, MoreHorizontal, etc).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferPolaris:
        'Prefer `@polaris/ui/icons` `{{polaris}}` over `lucide-react` `{{lucide}}`. The design team\'s icon set is the authoritative source. Suppress with `// eslint-disable-next-line @polaris/prefer-polaris-icon` if `lucide-react` is required (e.g. inside @polaris/ui itself).',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'lucide-react') return;
        for (const spec of node.specifiers) {
          if (spec.type !== 'ImportSpecifier') continue;
          const importedNode = (spec as unknown as { imported: { name?: string; type?: string } }).imported;
          if (!importedNode || typeof importedNode.name !== 'string') continue;
          const lucideName = importedNode.name;
          const polarisName = LUCIDE_TO_POLARIS[lucideName];
          if (!polarisName) continue;
          context.report({
            node: spec,
            messageId: 'preferPolaris',
            data: { lucide: lucideName, polaris: polarisName },
          });
        }
      },
    };
  },
};

export default rule;
