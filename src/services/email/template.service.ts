import fs from 'fs/promises'
import path from 'path'
import handlebars from 'handlebars'

import Logger from '@src/lib/logger'
import { customError } from '@src/Shared/utils/errorUtils'

export interface TemplateData {
  [key: string]: any
}

export class TemplateService {
  private readonly templatesPath: string
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map()

  constructor() {
    this.templatesPath = path.join(__dirname, 'templates')
  }

  async renderTemplate(
    templateName: string,
    data: TemplateData
  ): Promise<{ html: string; text: string }> {
    try {
      const htmlTemplate = await this.getTemplate(`${templateName}.html`)
      const textTemplate = await this.getTemplate(`${templateName}.txt`)

      const html = htmlTemplate(data)
      const text = textTemplate(data)

      return { html, text }
    } catch (error) {
      Logger.error(`Failed to render template: ${templateName}`, error)
      throw customError('internalServerError', 'Failed to render email template')
    }
  }

  private async getTemplate(templateFile: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templateFile)) {
      return this.templateCache.get(templateFile)!
    }

    try {
      const templatePath = path.join(this.templatesPath, templateFile)
      const templateContent = await fs.readFile(templatePath, 'utf-8')
      const compiledTemplate = handlebars.compile(templateContent)
      
      this.templateCache.set(templateFile, compiledTemplate)
      return compiledTemplate
    } catch (error) {
      Logger.error(`Template not found: ${templateFile}`, error)
      throw customError('notFound', `Email template not found: ${templateFile}`)
    }
  }

  clearCache(): void {
    this.templateCache.clear()
    Logger.info('Template cache cleared')
  }
}
