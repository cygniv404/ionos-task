import base64
from enum import Enum
from typing import List, Tuple

from ionos import settings


class ExtendedEnum(Enum):
    @classmethod
    def get_as_tuple(cls) -> List[Tuple]:
        #  return str representation of value to allow for objects as values
        return [(item.name, str(item.value)) for item in cls]


def save_file(file_data: dict) -> str:
    file_bytes = file_data['data'].encode("ascii")
    file_name = file_data['name']
    file_path = f"{settings.UPLOAD_TEST_DIR}/{file_name}"
    file_base_path = f"{settings.UPLOAD_TEST_BASE_DIR}/{file_name}"

    with open(file_base_path, "wb") as fh:
        fh.write(base64.decodebytes(file_bytes))
    fh.close()
    return file_path
