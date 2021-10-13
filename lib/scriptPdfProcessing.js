const PdfManipulator = require('./utils/pdfManipulator')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid/v4')
const { exec, execSync } = require('child_process')
module.exports = async (inputs, renderCallbackAsync) => {
  const { pdfContent, logger, operations, pdfMeta, pdfPassword, pdfSign, outlines, request, removeHiddenMarks } = inputs

  const runRenderCallback = async (shortidOrTemplate, data) => {
    const res = await renderCallbackAsync({
      shortidOrTemplate,
      data
    })
    return Buffer.from(res.content, 'base64')
  }

  try {
    const pdfBuf = Buffer.from(pdfContent, 'base64')
    const curPDF = path.join(process.cwd(), 'temp', uuid() + '.pdf')
    fs.writeFileSync(curPDF, pdfBuf, { encoding: 'binary' })
    // console.log(pdfContent, 'PdfManipulatorPdfManipulatorPdfManipulatorPdfManipulatorPdfManipulator')
    // const manipulator = PdfManipulator(pdfBuf, { pdfMeta, pdfPassword, pdfSign, outlines, removeHiddenMarks, hiddenPageFields: request.context.shared.pdfUtilsHiddenPageFields })
    const operationsToProcess = operations.filter(o => o.templateShortid || o.template)

    logger.debug(`pdf-utils detected ${operationsToProcess.length} pdf operation(s) to process`)

    const appendsFilesPromises = operationsToProcess.filter((operation) => {
      return operation.type === 'append2'
      // if (operation.type === 'append2') {
      //   // const appendPDF = templateDef.staticPdf.pdfAsset.content
        
      //   // const appendBuffer = await runRenderCallback(templateDef, { $pdf: { pages: 1 } })
      //   // const currentBuffer = pdfBuf
      //   console.log(curPDF, appendPDF)
      //   // await manipulator.append2(await runRenderCallback(templateDef, { $pdf: { pages: 1 } }))
      // }
      // return 
    }).map(async(operation) => {
      let templateDef

      if (operation.templateShortid) {
        templateDef = operation.templateShortid
      } else {
        templateDef = operation.template
      }
      const appendPDF = path.join(process.cwd(), 'temp', uuid() + '.pdf')
      const appendBuffer = await runRenderCallback(templateDef, { $pdf: { pages: 1 } })
      fs.writeFileSync(appendPDF, appendBuffer, { encoding: 'binary' })
      return appendPDF
    })
    const appendsFiles = await Promise.all(appendsFilesPromises)
    console.log(curPDF, appendsFiles)
    // for (const operation of operationsToProcess) {
    //   if (operation.enabled === false) {
    //     logger.debug(`Skipping disabled pdf operation ${operation.type}`)
    //     continue
    //   }

    //   // await manipulator.parse({
    //   //   hiddenPageFields: request.context.shared.pdfUtilsHiddenPageFields
    //   // })

    //   let templateDef

    //   if (operation.templateShortid) {
    //     templateDef = operation.templateShortid
    //   } else {
    //     templateDef = operation.template
    //   }

    //   logger.debug(`pdf-utils running pdf operation ${operation.type}`)

    //   if (operation.type === 'append2') {
    //     // const appendPDF = templateDef.staticPdf.pdfAsset.content
    //     const appendPDF = path.join(process.cwd(), 'temp', uuid() + '.pdf')
    //     fs.writeFileSync(appendPDF, templateDef.staticPdf.pdfAsset.content.data, { encoding: 'binary' })
    //     // const appendBuffer = await runRenderCallback(templateDef, { $pdf: { pages: 1 } })
    //     // const currentBuffer = pdfBuf
    //     console.log(curPDF, appendPDF)
    //     // await manipulator.append2(await runRenderCallback(templateDef, { $pdf: { pages: 1 } }))
    //     continue
    //   }

    //   if (operation.type === 'prepend') {
    //     await manipulator.prepend(await runRenderCallback(templateDef, { $pdf: { pages: manipulator.parsedPdf.pages } }))
    //     continue
    //   }

    //   if (operation.type === 'merge') {
    //     if (operation.mergeWholeDocument) {
    //       const mergeBuffer = await runRenderCallback(templateDef, { $pdf: { pages: manipulator.parsedPdf.pages } })
    //       await manipulator.merge(mergeBuffer, operation.mergeToFront)
    //       continue
    //     }

    //     let singleMergeBuffer = !operation.renderForEveryPage
    //       ? await runRenderCallback(templateDef, { $pdf: { pages: manipulator.parsedPdf.pages } }) : null

    //     const pagesBuffers = []

    //     for (let i = 0; i < manipulator.parsedPdf.pages.length; i++) {
    //       if (!singleMergeBuffer && manipulator.parsedPdf.pages[i].group) {
    //         logger.debug(`pdf-utils invokes merge with group ${manipulator.parsedPdf.pages[i].group}`)
    //       }

    //       pagesBuffers[i] = singleMergeBuffer || await runRenderCallback(templateDef, {
    //         $pdf: {
    //           pages: manipulator.parsedPdf.pages,
    //           pageIndex: i,
    //           pageNumber: i + 1
    //         }
    //       })
    //     }

    //     await manipulator.merge(pagesBuffers, operation.mergeToFront)
    //     continue
    //   }
    // }

    // logger.debug(`pdf-utils postproces start`)
    // await manipulator.postprocess({
    //   hiddenPageFields: request.context.shared.pdfUtilsHiddenPageFields
    // })
    // logger.debug(`pdf-utils postproces end`)

    const final = path.join(process.cwd(), 'temp', uuid() + '.pdf')
    execSync(`C:\\qpdf-10.3.2-bin-mingw64\\qpdf-10.3.2\\bin\\qpdf.exe --empty --pages ${[curPDF, ...appendsFiles].join(' ')} -- ${final}`)
    const buf = fs.readFileSync(final)
    // console.log(buf)
    // const resultPdfBuffer = await manipulator.toBuffer()

    return {
      pdfContent: buf.toString('base64')
    }
  } catch (e) {
    return {
      error: {
        message: e.message,
        stack: e.stack
      }
    }
  }
}
