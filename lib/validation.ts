interface ValidationRule {
  pattern: RegExp;
  message: string;
  severity: "error" | "warning";
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    pattern: /use\s+alkanes_runtime::runtime::AlkaneResponder/,
    message: "Missing AlkaneResponder import",
    severity: "error",
  },
  {
    pattern: /use\s+alkanes_support::response::CallResponse/,
    message: "Missing CallResponse import",
    severity: "error",
  },
  {
    pattern: /impl\s+AlkaneResponder\s+for/,
    message: "Must implement AlkaneResponder trait",
    severity: "error",
  },
  {
    pattern: /#\[derive\(Default\)\]/,
    message: "Struct must derive Default",
    severity: "error",
  },
  {
    pattern: /declare_alkane!/,
    message: "Missing declare_alkane! macro",
    severity: "warning",
  },
];

export function validateEditor(editor: any, monaco: any) {
  const model = editor.getModel();
  const code = editor.getValue();
  const markers: any[] = [];

  // VALIDATION_RULES.forEach((rule) => {
  //   if (!rule.pattern.test(code)) {
  //     markers.push({
  //       severity:
  //         rule.severity === "error"
  //           ? monaco.MarkerSeverity.Error
  //           : monaco.MarkerSeverity.Warning,
  //       message: rule.message,
  //       startLineNumber: 1,
  //       startColumn: 1,
  //       endLineNumber: 1,
  //       endColumn: 1,
  //     });
  //   }
  // });

  // Check for unwrap() usage
  const lines: string[] = code.split("\n");
  // lines.forEach((line, index) => {
  //   const unwrapMatches = [...line.matchAll(/\.unwrap\(\)/g)];
  //   unwrapMatches.forEach((match) => {
  //     if (match.index !== undefined) {
  //       markers.push({
  //         severity: monaco.MarkerSeverity.Warning,
  //         message: "Consider using ? operator instead of unwrap()",
  //         startLineNumber: index + 1,
  //         endLineNumber: index + 1,
  //         startColumn: match.index + 1,
  //         endColumn: match.index + match[0].length + 1,
  //       });
  //     }
  //   });
  // });

  monaco.editor.setModelMarkers(model, "alkanes-validator", markers);
}

export function setupCompletions(monaco: any) {
  monaco.languages.registerCompletionItemProvider("rust", {
    provideCompletionItems: () => ({
      suggestions: [
        {
          label: "declare_alkane",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "declare_alkane!{${1:ContractName}}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Declares the ALKANE contract entry point",
        },
        {
          label: "alkanes_imports",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "use alkanes_runtime::runtime::AlkaneResponder;",
            "use alkanes_support::response::CallResponse;",
            "use metashrew_support::compat::{to_arraybuffer_layout, to_passback_ptr};",
            "use anyhow::Result;",
          ].join("\n"),
          documentation: "Common Alkanes imports",
        },
      ],
    }),
  });
}
