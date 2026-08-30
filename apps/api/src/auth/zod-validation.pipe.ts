import { BadRequestException, type PipeTransform } from '@nestjs/common'
import { flattenError, type ZodType } from 'zod'

/** Validates a request body against a shared Zod schema and unwraps the parsed data. */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException(flattenError(result.error))
    }
    return result.data
  }
}
