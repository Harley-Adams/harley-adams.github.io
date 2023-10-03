import ProfessionalDataPoint from './ProfessionalDataPoint';
import xboxImg from '../images/xboxlogo.png'
import swayImg from '../images/sway.png'
import fiservImg from '../images/fiserv.png'
import ninjaKiwiImg from '../images/ninjakiwi.png'
import uoaImg from '../images/UoA.png'

export const ProfessionalConstants: ProfessionalDataPoint[] = [
    {
        LeftImagePost: false,
        Header: 'Senior Software Engineer/Tech Lead, Xbox/PlayFab',
        TimeLine: 'February 2020 – Present',
        Description: `Doing cool stuff`,
        ImageFileName: xboxImg,
        ImageAltText: 'Xbox Logo',
        LinkText: 'Check out playfab',
        LinkUrl: 'https://playfab.com//',
    }, 
    {
        LeftImagePost: true,
        Header: 'Software Engineer II, Microsoft',
        TimeLine: 'February 2016 – February 2020',
        Description: `"Instrumental in making Sway accessible” - not only from a
        compliance perspective but also ensuring that the experience
        is "delightful" to all users. Assessing new feature work
        for the Sway team as well as triaging and fixed bug bounties
        reported by the public to ensure the Sway service stays safe and secure.
        Designed and implemented the full stack for the Sway Author Analytics
        feature giving authors the ability to see how their Sways are consumed.
        This involved client tracking and data display in our website, creating
        endpoints for the different Sway clients to post and fetch data,
        using the azure stream analytics to process data and SQL database for storing
        data.`,
        ImageFileName: swayImg,
        ImageAltText: 'Sway Logo',
        LinkText: 'Check out Microsoft Sway',
        LinkUrl: 'https://sway.office.com/',
    },
    {
        LeftImagePost: false,
        Header: 'Junior Software Engineer, Fiserv',
        TimeLine: 'August 2015 – January 2016',
        Description: `I worked heavily in C# and .NET writing backend services for mobile banking applications and deployment pipelines for those services.`,
        ImageFileName: fiservImg,
        ImageAltText: 'Fiserv Logo',
    },
    {
        LeftImagePost: true,
        Header: 'Game Tester, Ninja Kiwi',
        TimeLine: 'September 2013 – December 2013',
        Description: `I did Beta testing on Bloons Monkey City and SAS Zombie Assault 4
        to help prepare Ninja Kiwi for the Christmas releases of these games.
        I gained experience with Jira and Git. I contributed to design and
        architectural decisions regarding the game’s programming
        with the developers and was responsible for gaining data on
        the balance of gameplay,
        as well as other gaming related data.`,
        ImageFileName: ninjaKiwiImg,
        ImageAltText: 'Ninja Kiwi Logo',
        LinkText: 'Check out Ninja Kiwi',
        LinkUrl: 'https://ninjakiwi.com/',
    },
    {
        LeftImagePost: false,
        Header: 'University of Auckland',
        TimeLine: 'BSc, specializing in Computer Science',
        Description: `Graduated June 2015. I worked as a Teaching assistant for the University of Auckland’s 
        Computer Science department during the third year of my undergraduate degree. 
        I assisted and taught students that had questions about their course material or work. 
        Also, I was awarded the UoA Jubilee Scholarship for hard work and determination.`,
        ImageFileName: uoaImg,
        ImageAltText: 'University of Auckland Logo',
    },
];
