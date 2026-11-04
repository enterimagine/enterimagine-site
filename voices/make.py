"""Generates the IMAGINE Kids episode voices with Azure AI Speech.

Runs in GitHub Actions. Reads voices/jobs.json, calls the Speech REST API
with the key from the AZURE_SPEECH_KEY secret and writes one .webm (Opus)
file per line to voices/out/. The key is only read from the environment.
"""
import json, os, sys, time, urllib.request, urllib.error
from xml.sax.saxutils import escape

key = os.environ.get('AZURE_SPEECH_KEY', '').strip()
region = os.environ.get('AZURE_SPEECH_REGION', '').strip()
if not key or not region:
    sys.exit('AZURE_SPEECH_KEY secret or AZURE_SPEECH_REGION variable is missing in the production environment.')
url = f'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1'
jobs = json.load(open(os.path.join(os.path.dirname(__file__), 'jobs.json'), encoding='utf-8'))
out = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(out, exist_ok=True)
failed = []
for j in jobs:
    lang = '-'.join(j['voice'].split('-')[:2])
    ssml = (f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{lang}">'
            f'<voice name="{j["voice"]}"><prosody rate="-4%" pitch="{j["pitch"]}">{escape(j["text"])}</prosody></voice></speak>')
    req = urllib.request.Request(url, data=ssml.encode('utf-8'), method='POST', headers={
        'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'webm-24khz-16bit-mono-opus', 'User-Agent': 'imagine-kids-voices'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            open(os.path.join(out, j['id'] + '.webm'), 'wb').write(data)
            print(j['id'], j['voice'], len(data), 'bytes'); break
        except urllib.error.HTTPError as e:
            print(j['id'], 'HTTP', e.code, e.reason)
            if e.code in (401, 403): sys.exit('The Speech key or region is not accepted (HTTP %d).' % e.code)
            time.sleep(3 * (attempt + 1))
        except Exception as e:
            print(j['id'], 'error', type(e).__name__); time.sleep(3 * (attempt + 1))
    else:
        failed.append(j['id'])
    time.sleep(0.4)  # stay well under the free tier's rate limit
print('done', len(jobs) - len(failed), 'of', len(jobs))
if failed: sys.exit('failed: ' + ', '.join(failed))
