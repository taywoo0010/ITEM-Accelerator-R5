"""Generate the model-review slides in the workshop's native style."""
from pathlib import Path
import runpy


if __name__ == "__main__":
    authoring = runpy.run_path(str(Path(__file__).with_name(".style_model_failure_slides.py")))
    authoring["generate"]()
