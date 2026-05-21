/**
 * `@polaris/ui/form` — react-hook-form components.
 *
 * Subpath export to keep `react-hook-form` out of the root `@polaris/ui`
 * bundle. Consumers that don't use Form don't need RHF installed.
 *
 * ```tsx
 * import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@polaris/ui/form';
 * import { Input, Button } from '@polaris/ui';
 * ```
 */
export * from '../components/Form';
