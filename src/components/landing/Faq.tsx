import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqData } from '@/lib/data';

const Faq = () => {
  return (
    <div className="py-12 md:py-20 bg-black">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-8">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqData.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="bg-[#2d2d2d] border-none">
              <AccordionTrigger className="text-lg md:text-2xl p-6 hover:no-underline [&_svg]:h-8 [&_svg]:w-8">
                <span className="flex-1 text-left">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-lg md:text-2xl p-6 pt-0 border-t-2 border-black">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Faq;
