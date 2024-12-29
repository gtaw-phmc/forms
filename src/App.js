import React, { useState } from 'react';
import './App.css';
import Paperwork from './myPaperwork2.png';
import Feedback from './feedback.png';

function App() {
    const [formData, setFormData] = useState({
        jobClassification: 'Forensic Attendant',
        placeOfDeath: '',
        department: '',
        dateTime: '',
        coronerName: '',
        serialNumber: '',
        decedentName: '',
        pronouncedTimeOfDeath: '',
        synopsis: '',
        probableCauseOfDeath: '',
        mannerOfDeath: 'Natural',
        typeOfDeath: 'PK',
        decedentOOC: '',
        scenePhotos: '',
        additionalImages: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };


    const departmentFullName = (abbreviation) => {
        switch (abbreviation) {
            case 'LSPD':
                return 'Los Santos Police Department';
            case 'LSFD':
                return 'Los Santos Fire Department';
            case 'LSSD':
                return 'Los Santos Sheriff Department';
            case 'PHMC':
                return 'Pillbox Hill Medical Center';
            case 'SANFIRE':
                return 'San Andreas Department of Forestry and Fire Protection';
            case 'SADCR':
                return 'San Andreas Department of Corrections and Rehabilitation';
            case 'LSGOV':
                return 'Los Santos City Government';
            case '911 Call':
                return 'Emergency 911 Dispatch Center';
            default:
                return '';
        }
    };
    function getBrowserName(userAgent) {
        if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
            return "Google Chrome";
        } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
            return "Safari";
        } else if (userAgent.includes("Firefox")) {
            return "Mozilla Firefox";
        } else if (userAgent.includes("Edg")) {
            return "Microsoft Edge";
        } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
            return "Internet Explorer";
        } else {
            return "Unknown Browser";
        }
    }

    const generateBBCode = () => {
        const {
            jobClassification,
            placeOfDeath,
            department,
            dateTime,
            coronerName,
            serialNumber,
            decedentName,
            pronouncedTimeOfDeath,
            synopsis,
            probableCauseOfDeath,
            mannerOfDeath,
            typeOfDeath,
            scenePhotos,
            additionalImages
        } = formData;

        const scenePhotosBBCode = scenePhotos.split(',').map(photo => `[img]${photo.trim()}[/img]`).join('\n');
        const additionalImagesBBCode = additionalImages.split(',').map(photo => `[img]${photo.trim()}[/img]`).join('\n');

        const bbCode = `[divbox=transparent][center][img]https://i.imgur.com/Hxjt4M2.png[/img][/center][/divbox]

[divbox=transparent][br][/br][center]DEATH INVESTIGATION REPORT[/center]
[hr][/hr]

[center][b]A. WRITTEN REPORT[/b][/center]

[list=none][color=transparent]spacer[/color]
The County Coroner's Office has been called regarding the decease that occurred at the location of [b]${placeOfDeath}[/b]. Upon receiving the call from[b] ${departmentFullName(department)}[/b], Coroner's Office dispatched a ${jobClassification} to the crime scene to conduct an investigation on the [b]${dateTime}[/b].

The ${jobClassification}, [b]${coronerName}[/b], Serial Number[b] ${serialNumber}[/b], arrived at the scene and identified the individual as[b] ${decedentName}[/b], who was pronounced dead at [b]${pronouncedTimeOfDeath}[/b]. Following an initial investigation, The ${jobClassification} came up with the following [b]synopsis[/b]: ${synopsis}

Based on the information gathered from the scene investigation and the decedent's medical history (if available), the probable cause of death was determined to be [b]${probableCauseOfDeath}[/b]. The manner of death was classified as [b]${mannerOfDeath}[/b].
[/list]

[list=none][color=transparent]spacer[/color][center][b]B. PHOTOGRAPHIC DOCUMENTARY RECORD[/b][/center]

[divbox=transparent][center][size=85][b][u]SCENE PHOTOGRAPHY[/u][/b][/size][/center][hr][/hr]
${scenePhotosBBCode}
[/divbox]

[divbox=transparent][center][size=85][b][u](( OUT OF CHARACTER ))[/u][/b][/size][/center][hr][/hr]
[size=75] This section clarifies whether or not if the player was character killed or player killed. 
In this case the player was; ${typeOfDeath}[/size]

[morgue screen, cinjuries, cdna links: 
${additionalImagesBBCode}
[/divbox]
[center][b]C. STATEMENT[/b][/center]

[divbox=transparent][center][size=85]As a ${jobClassification}, I have made detailed notes of my findings and conclusions, and these notes are available for review if necessary. However, I must note that these notes do not contain any personal opinions and are solely based on the evidence and facts available to me.

In conclusion, I hope that this report provides the necessary information required for the agency to move forward with any necessary actions. Please let me know if you require any additional information or if I can be of further assistance.

I certify that the information contained in this report is true and accurate to the best of my knowledge and belief. I have reviewed the report and ensured that all information included is complete and accurate. [/size][/divbox]

[center][b]D. PRIVACY AND CONFIDENTIALITY[/b][/center]

[divbox=transparent][center][size=85]This document from the Forensic Medicine and Pathology Department of Pillbox Hill Medical Center certifies the authenticity of the information contained within. Any unauthorized distribution or use of this information is in violation of the Health Insurance Portability and Accountability Act (HIPAA), as well as state and federal privacy laws, including but not limited to the San Andreas Confidentiality of Medical Information Act (CMIA) and the San Andreas Information Practices Act (IPA).

It is imperative that all parties handling this document respect the privacy and confidentiality of the decedent and their family. Any violation of these laws may result in legal action being taken against the responsible parties.

This document is provided for official purposes only and is not to be construed as legal advice or medical diagnosis. If additional information or clarification is needed, please contact the Forensic Medicine and Pathology Department of Pillbox Hill Medical Center.[/size][/divbox]`;

        return bbCode;
    };

    const generateTitle = () => {
        const { typeOfDeath, decedentName, decedentOOC, dateTime } = formData;
        const date = new Date(dateTime).toLocaleDateString('en-US');
        return `[${typeOfDeath}] ${decedentName} ((${decedentOOC})) - ${date}`;
    };

    return (
        <div className="App">
            <div className="container">
                <div className="form-container">
                    <h2>Death Investigation Report Form</h2>
                    <h5>You can now use the `Install App` feature in the browser!</h5>
                    <a href="https://github.com/LPX-Dev/phmc-death-report/tree/main" target="_blank" rel="noopener noreferrer">
                        <h5>This website is fully open source and was made by Fr0sty, you can report bugs in the PHMC Discord.</h5>
                    </a>
                    <details>
                        <summary>Change Log - 1.8</summary>
                        <ul>
                            <li>Murdered Christmas. </li>
                            <li>Error detection.</li>
                            <li>The Grinch update.</li>
                            <li>NEW: Added App Support</li>
                        </ul>
                    </details>
                    <button type="button" onClick={() => {
                        const title = generateTitle();
                        navigator.clipboard.writeText(title).then(() => {
                            window.open('https://phmc.gta.world/viewforum.php?f=255', '_blank');
                        });
                    }}>
                        DMEC forums
                    </button>
                    <button type="button" onClick={() => {
                        const title = generateTitle();
                        navigator.clipboard.writeText(title).then(() => {
                            window.open('https://lpx-dev.github.io/phmc-email-generator/', '_blank');
                        });
                    }}>
                        PHMC Email Generator
                    </button>
                    <form>
                        <label>
                            Job Classification:
                            <select name="jobClassification" value={formData.jobClassification} onChange={handleChange} required>
                                <option value="Trainee Forensic Attendant">Trainee Forensic Attendant</option>
                                <option value="Forensic Attendant">Forensic Attendant</option>
                                <option value="Senior Forensic Attendant">Senior Forensic Attendant </option>
                                <option value="Supervising Forensic Attendant">Supervising Forensic Attendant</option>
                                <option value="Coroner Investigator">Coroner Investigator</option>
                                <option value="Supervising Coroner Investigator">Supervising Coroner Investigator</option>
                                <option value="Medical Examiner">Medical Examiner</option>
                                <option value="Supervising Medical Examiner">Supervising Medical Examiner</option>
                                <option value="Deputy Chief Medical Examiner">Deputy Chief Medical Examiner</option>
                                <option value="Chief Medical Examiner">Chief Medical Examiner</option>
                            </select>
                        </label>
                        <label>
                            Type of Death:
                            <select name="typeOfDeath" value={formData.typeOfDeath} onChange={handleChange} required>
                                <option value="PK">PK</option>
                                <option value="CK">CK</option>
                            </select>
                        </label>
                        <label>
                            Decedents Name ((OOC)):
                            <input type="text" name="decedentOOC" value={formData.decedentOOC} onChange={handleChange} placeholder="John Snow" required />
                        </label>
                        <label>
                            Place of Death:
                            <input type="text" name="placeOfDeath" value={formData.placeOfDeath} onChange={handleChange} placeholder="Mirror Park" required />
                        </label>
                        <label>
                            Department:
                            <select name="department" value={formData.department} onChange={handleChange} required>
                                <option value="" disabled>Select Department</option>
                                <option value="LSFD">LSFD</option>
                                <option value="LSPD">LSPD</option>
                                <option value="LSSD">LSSD</option>
                                <option value="PHMC">PHMC</option>
                                <option value="SANFIRE">SANFIRE</option>
                                <option value="SADCR">SADCR</option>
                                <option value="LSGOV">LSGOV</option>
                                <option value="911 Call">Emergency 911 Dispatch</option>
                            </select>
                        </label>
                        <label>
                            Date and Time:
                            <input type="datetime-local" name="dateTime" value={formData.dateTime} onChange={handleChange} required />
                        </label>
                        <label>
                            Coroner Name:
                            <input type="text" name="coronerName" value={formData.coronerName} onChange={handleChange} placeholder="Anne Carter" required />
                        </label>
                        <label>
                            Badge Number: ((/badge [Your ID]))
                            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required />
                        </label>
                        <label>
                            Decedent Name:
                            <input type="text" name="decedentName" value={formData.decedentName} onChange={handleChange} placeholder="Jane / John Doe" required />
                        </label>
                        <label>
                            Pronounced Time of Death:
                            <input type="datetime-local" name="pronouncedTimeOfDeath" value={formData.pronouncedTimeOfDeath} onChange={handleChange} required />
                        </label>
                        <label>
                            Brief Summary:
                            <textarea name="synopsis" value={formData.synopsis} onChange={handleChange} rows="4" required></textarea>
                        </label>
                        <label>
                            Probable Cause of Death:
                            <input type="text" name="probableCauseOfDeath" value={formData.probableCauseOfDeath} onChange={handleChange} required />
                        </label>
                        <label>
                            Manner of Death:
                            <select name="mannerOfDeath" value={formData.mannerOfDeath} onChange={handleChange} required>
                                <option value="Natural">Natural - the death resulted from natural causes, such as disease or old age.</option>
                                <option value="Accident">Accidental - the death resulted from an unintentional or unexpected event, such as a car accident or drug overdose.</option>
                                <option value="Suicide">Suicide - the death resulted from a self-inflicted injury with the intention to end ones life.</option>
                                <option value="Homicide">Homicide - the death resulted from the intentional actions of another person, such as a murder or manslaughter.</option>
                                <option value="Undetermined">Undetermined - the evidence is insufficient to determine the manner of death</option>
                            </select>
                        </label>
                        <label>
                            Scene Photos Links (comma-separated):
                            <textarea name="scenePhotos" value={formData.scenePhotos} onChange={handleChange} rows="2" required></textarea>
                        </label>
                        <label>
                            Morgue Screen, Cinjuries, CDNA Links (comma-separated):
                            <textarea name="additionalImages" value={formData.additionalImages} onChange={handleChange} rows="2" required></textarea>
                        </label>
                    </form>
                </div>
                <div className="output-container">
                    <div className="image-container">
                        <a href="discord://discord.com/channels/860254678653992992/1247889726204022956" target="_blank" rel="noopener noreferrer">
                            <img src={Feedback}    
                                height={350}
                                width={350}
                                className="Center"
                            />
                        </a>
                    </div>
                    <h2>Generated BBCode</h2>

                    <div className="bbcode-output">
                        <pre>{generateBBCode()}</pre>
                    </div>
                    <h1>Generated Title</h1>
                    <div className="title-output">
                        <pre>{generateTitle()}</pre>
                    </div>
                    <button type="button" onClick={() => {
                        const title = generateTitle();
                        navigator.clipboard.writeText(title).then(() => {
                        });
                    }}>Copy Title</button>

                    <button type="button" onClick={() => {
                        const bbCode = generateBBCode();
                        const currentDateTime = new Date().toLocaleString(); // Initialize the variable with the current date and time
                        const userAgent = navigator.userAgent; // Get the user agent string
                        const browserName = getBrowserName(userAgent); // Get the browser name

                        navigator.clipboard.writeText(bbCode).then(() => {
                            // Send POST request to Discord Webhook
                            fetch('https://discord.com/api/webhooks/REDACTED', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    content: `A Coroner has used your website!\nTimestamp: ${currentDateTime}\nBrowser: ${browserName}\nUser Agent: ${userAgent}\n` 
                                })
                            }).then(response => {
                                if (response.ok) {
                                    console.log('Done!');
                                } else {
                                    return response.text().then(text => { // Get more details on the error
                                        throw new Error(`Something has gone wrong: ${response.status} - ${text}`);
                                    });
                                }
                            }).catch(error => {
                                console.error('Error:', error);

                                // Send error message to Discord Webhook
                                fetch('https://discord.com/api/webhooks/REDACTED', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        content: `An error occurred: ${error.message}\nTimestamp: ${currentDateTime}\nBrowser: ${browserName}\nUser Agent: ${userAgent}`
                                    })
                                }).then(response => {
                                    if (response.ok) {
                                        console.log('Error reported to Discord successfully!');
                                    } else {
                                        console.error('Failed to report error to Discord:', response.status, response.statusText);
                                    }
                                }).catch(reportError => {
                                    console.error('Error reporting to Discord failed:', reportError);
                                });
                            });
                        }).catch(error => {
                            console.error('Clipboard write failed:', error);

                            // Send error message to Discord Webhook
                            fetch('https://discord.com/api/webhooks/REDACTED', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    content: `Clipboard write failed: ${error.message}\nTimestamp: ${currentDateTime}\nBrowser: ${browserName}\nUser Agent: ${userAgent}`
                                })
                            }).then(response => {
                                if (response.ok) {
                                    console.log('Error reported to Discord successfully!');
                                } else {
                                    console.error('Failed to report error to Discord:', response.status, response.statusText);
                                }
                            }).catch(reportError => {
                                console.error('Error reporting to Discord failed:', reportError);
                            });
                        });
                    }}>Copy BBCode</button>

                    <div className="image-container">
                        <a href="https://phmc.gta.world/posting.php?mode=post&f=267" target="_blank" rel="noopener noreferrer">
                        <img src={Paperwork} 
                            height={350}
                            width={350}
                            className="Center"
                            />
                    </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;