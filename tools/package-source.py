"""Package the corresponding source without secrets or generated dependencies.
Run with Python 3: python tools/package-source.py
The archive is served by Next.js at /source/sertec-flow-source.zip.
"""
from pathlib import Path
import subprocess
import os
import zipfile

root = Path(__file__).resolve().parents[1]
destination = root / "apps/web/public/source/sertec-flow-source.zip"
destination.parent.mkdir(parents=True, exist_ok=True)
# Git's inventory avoids following node_modules, caches and ignored credentials.
result = subprocess.run(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    cwd=root, capture_output=True,
)
if result.returncode == 0:
    files = sorted(set(result.stdout.decode("utf-8").split("\0")) - {""})
else:
    # Source archives have no .git directory. Keep them rebuildable too.
    excluded = {".git", "node_modules", ".next", ".turbo", ".cache", "dist", "build", "coverage", "__pycache__"}
    files = []
    for directory, dirs, names in os.walk(root):
        dirs[:] = [name for name in dirs if name not in excluded]
        for name in names:
            if name == "__ENV.js" or name.endswith((".tsbuildinfo", ".log")):
                continue
            files.append((Path(directory) / name).relative_to(root).as_posix())
with zipfile.ZipFile(destination, "w", zipfile.ZIP_DEFLATED) as archive:
    for relative in files:
        source = root / relative
        if source == destination or not source.is_file() or source.is_symlink():
            continue
        if source.name.startswith(".env") and not source.name.endswith(".example"):
            continue
        archive.write(source, "sertec-flow/" + relative)
print(destination)
