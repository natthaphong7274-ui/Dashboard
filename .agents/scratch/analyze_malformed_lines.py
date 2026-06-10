import subprocess
import re

# Get git diff of src/Scripts.html comparing current code with HEAD~2 (original clean code)
r = subprocess.run(['git', 'diff', 'HEAD~2', '--', 'src/Scripts.html'], capture_output=True, text=True, encoding='utf-8')
diff_output = r.stdout

added_lines = []
for line in diff_output.split('\n'):
    if line.startswith('+') and not line.startswith('+++'):
        added_lines.append(line[1:]) # remove the '+' prefix

def find_literal_spans(line):
    spans = []
    in_quote = None
    escaped = False
    start = -1
    
    i = 0
    n = len(line)
    while i < n:
        c = line[i]
        if escaped:
            escaped = False
            i += 1
            continue
        if c == '\\':
            escaped = True
            i += 1
            continue
        if in_quote:
            if c == in_quote:
                spans.append((start, i + 1))
                in_quote = None
        else:
            if c == '/' and i + 1 < n:
                if line[i+1] == '/':
                    break
                elif line[i+1] == '*':
                    end_cmt = line.find('*/', i + 2)
                    if end_cmt != -1:
                        i = end_cmt + 2
                        continue
                    else:
                        break
            if c in ["'", '"', '`']:
                in_quote = c
                start = i
        i += 1
    return spans

suspicious_lines = []
for idx, line in enumerate(added_lines):
    spans = find_literal_spans(line)
    for start, end in spans:
        literal = line[start:end]
        inner = literal[1:-1]
        
        # Check if this literal contains unbalanced tag characters
        # For example, < without > or > without <, or a closing tag like </div
        has_lt = '<' in inner
        has_gt = '>' in inner
        
        # If it has only one of them, it's unbalanced!
        if (has_lt and not has_gt) or (has_gt and not has_lt) or ('</' in inner):
            suspicious_lines.append((line, literal))
            break

print(f"Found {len(suspicious_lines)} suspicious lines with unbalanced HTML literals:")
for line, literal in suspicious_lines[:50]:
    print(f"Line: {line.strip()}")
    print(f"  Suspicious literal: {literal}")
