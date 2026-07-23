"""
Validation utility functions for uploaded files (file size, extensions, emptiness).
"""

from fastapi import UploadFile
from app.core.exceptions import FileUploadError
from app.utils.constants import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES


def validate_file_extension(filename: str) -> str:
    """
    Validate and return the lowercased file extension.
    Raises FileUploadError if the extension is unsupported.
    """
    if "." not in filename:
        raise FileUploadError("Uploaded file has no extension.")
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise FileUploadError(
            f"Extension '.{ext}' is not supported. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    return ext


async def validate_uploaded_file(file: UploadFile) -> bytes:
    """
    Read and validate uploaded file content for size and empty checks.
    Returns the file content bytes.
    Raises FileUploadError on validation failure.
    """
    if not file.filename:
        raise FileUploadError("Filename is missing.")

    validate_file_extension(file.filename)

    content = await file.read()
    if len(content) == 0:
        raise FileUploadError("Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise FileUploadError("Uploaded file size exceeds the 10 MB limit.")

    # Reset file seek cursor for subsequent operations if needed
    await file.seek(0)
    return content
