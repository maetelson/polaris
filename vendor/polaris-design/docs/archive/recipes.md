# Polaris Recipes

자주 쓰는 컴포넌트 조합. 각 레시피는 stand-alone로 복사해 쓸 수 있습니다.

---

## 1. Form: react-hook-form + zod (사내 표준, v0.4+)

`<Form>` + `<FormField>` 컴포넌트로 wiring을 간소화 (shadcn 패턴):

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Input, Textarea, Checkbox, Button, Stack, toast,
} from '@polaris/ui';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage,
} from '@polaris/ui/form';  // ← subpath: keeps RHF out of root bundle

const schema = z.object({
  name: z.string().min(2, '2자 이상 입력하세요'),
  email: z.string().email('이메일 형식이 올바르지 않습니다'),
  message: z.string().min(10, '10자 이상 입력하세요').max(500),
  agree: z.literal(true, { errorMap: () => ({ message: '약관에 동의해야 합니다' }) }),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await fetch('/api/contact', { method: 'POST', body: JSON.stringify(values) });
    toast({ title: '전송됨', description: '곧 답변드리겠습니다.', variant: 'success' });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormDescription>회신용 이메일</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>메시지</FormLabel>
                <FormControl><Textarea rows={5} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agree"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    label="이용 약관에 동의합니다"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" loading={form.formState.isSubmitting}>전송</Button>
        </Stack>
      </form>
    </Form>
  );
}
```

장점:
- `FormLabel`이 자동으로 input과 `htmlFor` wiring
- error 시 label 색이 자동으로 `state.error` (v0.8: was `status.danger`)
- `aria-invalid` / `aria-describedby` 자동 연결
- error 메시지는 `<FormMessage />`가 자동으로 RHF의 errors 읽음

복잡한 wiring 없는 단순 form은 기존 `<Input label helperText error />` 패턴도 여전히 OK. (v0.8: `hint` → `helperText`.)

---

## 2. Confirm Dialog

삭제·종료처럼 영향이 큰 액션 확인:

```tsx
'use client';
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, Button, toast } from '@polaris/ui';

export function DeleteContractButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const onDelete = async () => {
    setPending(true);
    await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
    setPending(false);
    setOpen(false);
    toast({ title: '계약이 삭제되었습니다', variant: 'success' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="danger">삭제</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이 계약을 삭제하시겠습니까?</DialogTitle>
          <DialogDescription>
            삭제된 계약은 복구할 수 없습니다. 결재선과 첨부 파일이 함께 제거됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="tertiary">취소</Button>
          </DialogClose>
          <Button variant="danger" onClick={onDelete} loading={pending}>삭제</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 3. Stat Card

대시보드용 KPI:

```tsx
import { Card, CardBody, Stack, Badge } from '@polaris/ui';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({
  label,
  value,
  delta,
  trend,
}: {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}) {
  return (
    <Card variant="padded">
      <Stack gap={1}>
        <span className="text-polaris-caption1 text-label-alternative uppercase tracking-wider">{label}</span>
        <span className="text-polaris-title text-label-normal">{value}</span>
        <Stack direction="row" gap={1} align="center">
          <Badge tone={trend === 'up' ? 'success' : 'error'}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta}
          </Badge>
          <span className="text-polaris-caption1 text-label-alternative">전월 대비</span>
        </Stack>
      </Stack>
    </Card>
  );
}
```

> **v0.8 note** — `<HStack>` / `<VStack>` 제거 → `<Stack>` 단일화. `text-polaris-caption` → `caption1`, `text-polaris-display-md` → `title`, `text-fg-primary/muted` → `text-label-normal/alternative`. Badge는 `variant` 대신 `tone` (status 색은 `tone`, 시각 강도는 `variant`로 분리). `pnpm dlx @polaris/lint polaris-codemod-v08 --apply` 한 번이면 다 자동 변환.

사용:
```tsx
<Stack direction="row" gap={4}>
  <StatCard label="MRR" value="₩12.4M" delta="+8.2%" trend="up" />
  <StatCard label="신규 계약" value="42" delta="+12" trend="up" />
  <StatCard label="이탈률" value="2.1%" delta="-0.4pp" trend="down" />
</Stack>
```

---

## 4. Table + Drawer Inspector

테이블 행 클릭 → 우측 Drawer로 상세:

```tsx
'use client';
import { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody, DescriptionList, DescriptionTerm, DescriptionDetails, Badge } from '@polaris/ui';

type Contract = { id: string; name: string; counterparty: string; status: 'pending' | 'signed' | 'expired'; amount: string };

export function ContractsTable({ contracts }: { contracts: Contract[] }) {
  const [selected, setSelected] = useState<Contract | null>(null);

  return (
    <>
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
          {contracts.map((c) => (
            <TableRow key={c.id} onClick={() => setSelected(c)} className="cursor-pointer">
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.counterparty}</TableCell>
              <TableCell>
                <Badge variant={c.status === 'signed' ? 'success' : c.status === 'expired' ? 'danger' : 'warning'}>
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{c.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent side="right">
          {selected && (
            <>
              <DrawerHeader>
                <DrawerTitle>{selected.name}</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <DescriptionList>
                  <DescriptionTerm>거래처</DescriptionTerm>
                  <DescriptionDetails>{selected.counterparty}</DescriptionDetails>
                  <DescriptionTerm>상태</DescriptionTerm>
                  <DescriptionDetails>
                    <Badge variant={selected.status === 'signed' ? 'success' : 'warning'}>
                      {selected.status}
                    </Badge>
                  </DescriptionDetails>
                  <DescriptionTerm>금액</DescriptionTerm>
                  <DescriptionDetails>{selected.amount}</DescriptionDetails>
                </DescriptionList>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
```

---

## 5. UserMenu with Server Action signout (Next.js)

DropdownMenu의 로그아웃이 server action을 트리거 — race condition 없이:

```tsx
'use client';
import { signOut } from '@/auth/actions'; // 'use server' action
import { Avatar, AvatarFallback, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuFormItem } from '@polaris/ui';
import { LogOut, User, Settings } from 'lucide-react';

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="!h-8 !w-8 !px-0 !rounded-polaris-pill">
          <Avatar size="sm">
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <div className="px-2.5 pb-1.5 text-polaris-caption1 text-label-alternative">{email}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem><User className="h-4 w-4" /> 계정 설정</DropdownMenuItem>
        <DropdownMenuItem><Settings className="h-4 w-4" /> 환경설정</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuFormItem
          action={signOut}
          destructive
          icon={<LogOut className="h-4 w-4" />}
        >
          로그아웃
        </DropdownMenuFormItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

`DropdownMenuFormItem`이 menu close vs form submit race를 자동 처리.
