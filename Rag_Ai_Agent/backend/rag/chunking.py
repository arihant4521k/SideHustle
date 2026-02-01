def chunk_text(text: str, chunk_chars: int = 1500, overlap_chars: int = 200):
    """    Splits text into chunks based on character count (approx 1500 chars ~ 300-400 tokens).    """
    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_chars
        
        # Don't cut words in half; try to find the last space
        if end < text_len:
            last_space = text.rfind(' ', start, end)
            if last_space != -1:
                end = last_space

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap_chars
        if start >= text_len:
            break
            
    return chunks
# OPENAI Dependancy

# import tiktoken


# def chunk_text(text: str, chunk_tokens: int = 450, overlap_tokens: int = 80):
#     enc = tiktoken.get_encoding("cl100k_base")
#     tokens = enc.encode(text)

#     chunks = []
#     start = 0
#     while start < len(tokens):
#         end = start + chunk_tokens
#         chunk = enc.decode(tokens[start:end])
#         chunks.append(chunk)
#         start = end - overlap_tokens
#         if start < 0:
#             start = 0

#     return chunks